"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NexusAgentWidget_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexusAgentWidget = void 0;
const React = __importStar(require("@theia/core/shared/react"));
const inversify_1 = require("@theia/core/shared/inversify");
const react_widget_1 = require("@theia/core/lib/browser/widgets/react-widget");
let NexusAgentWidget = NexusAgentWidget_1 = class NexusAgentWidget extends react_widget_1.ReactWidget {
    init() {
        this.id = NexusAgentWidget_1.ID;
        this.title.label = 'Nexus Agent';
        this.title.caption = 'Nexus Agent';
        this.title.iconClass = 'fa fa-robot';
        this.title.closable = true;
        this.update();
    }
    render() {
        return (React.createElement("div", { className: "nexus-agent-container", style: { padding: '15px', color: 'var(--theia-ui-font-color1)' } },
            React.createElement("h3", null, "Nexus Agent Framework"),
            React.createElement("p", null, "Hello from the dedicated Theia Extension!"),
            React.createElement("div", { style: { marginTop: '20px', padding: '10px', background: 'var(--theia-input-background)', border: '1px solid var(--theia-dropdown-border)' } },
                React.createElement("p", null, "I am securely docked in the right panel and integrated deeply with Theia's LSP and command structures.")),
            React.createElement("input", { type: "text", placeholder: "Ask agent...", style: { width: '100%', marginTop: 'auto', padding: '8px', background: 'var(--theia-input-background)', color: 'var(--theia-input-foreground)', border: '1px solid var(--theia-input-border)' } })));
    }
};
exports.NexusAgentWidget = NexusAgentWidget;
NexusAgentWidget.ID = 'nexus-agent:widget';
__decorate([
    (0, inversify_1.postConstruct)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NexusAgentWidget.prototype, "init", null);
exports.NexusAgentWidget = NexusAgentWidget = NexusAgentWidget_1 = __decorate([
    (0, inversify_1.injectable)()
], NexusAgentWidget);
//# sourceMappingURL=nexus-agent-widget.js.map