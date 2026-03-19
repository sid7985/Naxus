"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexusAgentContribution = exports.NexusAgentCommand = void 0;
const inversify_1 = require("@theia/core/shared/inversify");
const browser_1 = require("@theia/core/lib/browser");
const nexus_agent_widget_1 = require("./nexus-agent-widget");
exports.NexusAgentCommand = {
    id: 'nexus.agent.toggle',
    label: 'Toggle Nexus Agent Sidebar'
};
let NexusAgentContribution = class NexusAgentContribution extends browser_1.AbstractViewContribution {
    constructor() {
        super({
            widgetId: nexus_agent_widget_1.NexusAgentWidget.ID,
            widgetName: 'Nexus Agent',
            defaultWidgetOptions: { area: 'right' },
            toggleCommandId: exports.NexusAgentCommand.id
        });
    }
    async registerCommands(commands) {
        super.registerCommands(commands);
    }
};
exports.NexusAgentContribution = NexusAgentContribution;
exports.NexusAgentContribution = NexusAgentContribution = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], NexusAgentContribution);
//# sourceMappingURL=nexus-agent-contribution.js.map