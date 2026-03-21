import Docker from 'dockerode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * SandboxService implements the 'NanoClaw' philosophy for NEXUS:
 * Untrusted AI code (or any code) should be executed inside an ephemeral sandbox.
 */
export class SandboxService {
  private isDockerAvailable = false;

  constructor() {
    this.checkDocker();
  }

  private async checkDocker() {
    try {
      await docker.ping();
      this.isDockerAvailable = true;
      console.log('[SandboxService] Docker is available. Executions will be strictly containerized.');
    } catch (e) {
      console.warn('[SandboxService] Docker not available on host system. Falling back to local unsafe execution (Demo Mode only!).');
      this.isDockerAvailable = false;
    }
  }

  async executeBash(command: string): Promise<string> {
    if (this.isDockerAvailable) {
      return this.executeInDocker(command);
    } else {
      return this.executeLocally(command);
    }
  }

  private async executeLocally(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      return stdout || stderr;
    } catch (error: any) {
      return `Execution Error: ${error.message}\n${error.stderr || ''}`;
    }
  }

  private async executeInDocker(command: string): Promise<string> {
    try {
      // Create an ephemeral node container (using node:18-alpine for speed)
      // This mimics NanoClaw's approach to sandboxing runs.
      const container = await docker.createContainer({
        Image: 'node:18-alpine',
        Cmd: ['sh', '-c', command],
        Tty: false,
        AttachStdout: true,
        AttachStderr: true,
      });

      await container.start();
      
      const stream = await container.logs({ follow: true, stdout: true, stderr: true });
      let output = '';
      
      return new Promise((resolve) => {
        stream.on('data', (chunk) => {
          // Docker logs format: 8 byte header + payload. Simple parse:
          output += chunk.toString('utf8').substring(8);
        });
        
        stream.on('end', async () => {
          // NanoClaw explicitly destroys the container after the shot
          await container.remove({ force: true });
          resolve(output);
        });
      });
      
    } catch (error: any) {
       console.error('[SandboxService] Container spin-up failed. Do you have the node:18-alpine image?', error);
       return `Container Error: ${error.message}`;
    }
  }
}

export const sandboxService = new SandboxService();
