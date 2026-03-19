import { injectable } from '@theia/core/shared/inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser';
import { NexusAgentWidget } from './nexus-agent-widget';

export const NexusAgentCommand = {
    id: 'nexus.agent.toggle',
    label: 'Toggle Nexus Agent Sidebar'
};

@injectable()
export class NexusAgentContribution extends AbstractViewContribution<NexusAgentWidget> {

    constructor() {
        super({
            widgetId: NexusAgentWidget.ID,
            widgetName: 'Nexus Agent',
            defaultWidgetOptions: { area: 'right' },
            toggleCommandId: NexusAgentCommand.id
        });
    }

    async registerCommands(commands: any): Promise<void> {
        super.registerCommands(commands);
    }
}
