import * as React from '@theia/core/shared/react';
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';

@injectable()
export class NexusAgentWidget extends ReactWidget {
    static readonly ID = 'nexus-agent:widget';

    @postConstruct()
    protected init(): void {
        this.id = NexusAgentWidget.ID;
        this.title.label = 'Nexus Agent';
        this.title.caption = 'Nexus Agent';
        this.title.iconClass = 'fa fa-robot';
        this.title.closable = true;
        this.update();
    }

    protected render(): React.ReactNode {
        return (
            <div className="nexus-agent-container" style={{ padding: '15px', color: 'var(--theia-ui-font-color1)' }}>
                <h3>Nexus Agent Framework</h3>
                <p>Hello from the dedicated Theia Extension!</p>
                <div style={{ marginTop: '20px', padding: '10px', background: 'var(--theia-input-background)', border: '1px solid var(--theia-dropdown-border)' }}>
                    <p>I am securely docked in the right panel and integrated deeply with Theia's LSP and command structures.</p>
                </div>
                <input 
                    type="text" 
                    placeholder="Ask agent..." 
                    style={{ width: '100%', marginTop: 'auto', padding: '8px', background: 'var(--theia-input-background)', color: 'var(--theia-input-foreground)', border: '1px solid var(--theia-input-border)' }} 
                />
            </div>
        );
    }
}
