"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var updates, _i, updates_1, u, campus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('[SYSTEM] Cập nhật lại tên các cơ sở đại học cho rõ ràng...');
                    updates = [
                        { old: 'Cơ sở A', newName: 'Cơ sở A (Nguyễn Đình Chiểu)' },
                        { old: 'Cơ sở B', newName: 'Cơ sở B (Nguyễn Tri Phương)' },
                        { old: 'Cơ sở N', newName: 'Cơ sở N (Nam Thành phố)' },
                        { old: 'Cơ sở Nam Thành phố', newName: 'Cơ sở N (Nam Thành phố)' }
                    ];
                    _i = 0, updates_1 = updates;
                    _a.label = 1;
                case 1:
                    if (!(_i < updates_1.length)) return [3 /*break*/, 5];
                    u = updates_1[_i];
                    return [4 /*yield*/, prisma.campus.findFirst({
                            where: { name: u.old }
                        })];
                case 2:
                    campus = _a.sent();
                    if (!campus) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.campus.update({
                            where: { id: campus.id },
                            data: { name: u.newName }
                        })];
                case 3:
                    _a.sent();
                    console.log("- C\u1EADp nh\u1EADt: ".concat(u.old, " -> ").concat(u.newName));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    console.log('[SUCCESS] Đã đổi tên xong!');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error).finally(function () { return prisma.$disconnect(); });
