import { ContainerModule } from '@theia/core/shared/inversify';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { NexusAgentContribution } from './nexus-agent-contribution';
import { NexusAgentWidget } from './nexus-agent-widget';
import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindViewContribution(bind, NexusAgentContribution);
    bind(FrontendApplicationContribution).toService(NexusAgentContribution);
    bind(NexusAgentWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: NexusAgentWidget.ID,
        createWidget: () => ctx.container.get<NexusAgentWidget>(NexusAgentWidget)
    })).inSingletonScope();
});
