"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockVideoProvider = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let MockVideoProvider = class MockVideoProvider {
    async createRoom(appointmentId) {
        const roomName = `gippo_room_${appointmentId.slice(0, 8)}_${Date.now()}`;
        const accessCode = (0, uuid_1.v4)().slice(0, 8);
        const joinUrl = `https://video.gippo.uz/room/${roomName}?code=${accessCode}`;
        return {
            roomName,
            accessCode,
            joinUrl,
        };
    }
    async generateToken(input) {
        const payload = Buffer.from(JSON.stringify({
            room: input.roomName,
            user: input.userId,
            name: input.userName,
            isDoctor: input.isDoctor,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
        })).toString('base64');
        return `vtoken.${payload}.sig_${(0, uuid_1.v4)().slice(0, 8)}`;
    }
};
exports.MockVideoProvider = MockVideoProvider;
exports.MockVideoProvider = MockVideoProvider = __decorate([
    (0, common_1.Injectable)()
], MockVideoProvider);
//# sourceMappingURL=mock-video.provider.js.map