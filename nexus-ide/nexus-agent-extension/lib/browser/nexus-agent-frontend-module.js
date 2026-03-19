"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("@theia/core/shared/inversify");
const browser_1 = require("@theia/core/lib/browser");
const nexus_agent_contribution_1 = require("./nexus-agent-contribution");
const nexus_agent_widget_1 = require("./nexus-agent-widget");
require("../../src/browser/style/index.css");
exports.default = new inversify_1.ContainerModule(bind => {
    (0, browser_1.bindViewContribution)(bind, nexus_agent_contribution_1.NexusAgentContribution);
    bind(browser_1.FrontendApplicationContribution).toService(nexus_agent_contribution_1.NexusAgentContribution);
    bind(nexus_agent_widget_1.NexusAgentWidget).toSelf();
    bind(browser_1.WidgetFactory).toDynamicValue(ctx => ({
        id: nexus_agent_widget_1.NexusAgentWidget.ID,
        createWidget: () => ctx.container.get(nexus_agent_widget_1.NexusAgentWidget)
    })).inSingletonScope();
});
//# sourceMappingURL=nexus-agent-frontend-module.js.map