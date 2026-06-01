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
var universities_1 = require("./data/universities");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, universities_2, uni, existingUni, _loop_1, _a, _b, campusName;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('[SYSTEM] Bắt đầu thêm các trường đại học mới...');
                    _i = 0, universities_2 = universities_1.universities;
                    _c.label = 1;
                case 1:
                    if (!(_i < universities_2.length)) return [3 /*break*/, 10];
                    uni = universities_2[_i];
                    console.log("\u0110ang x\u1EED l\u00FD: ".concat(uni.name));
                    return [4 /*yield*/, prisma.university.findUnique({
                            where: { id: uni.id },
                            include: { campuses: true }
                        })];
                case 2:
                    existingUni = _c.sent();
                    if (!existingUni) return [3 /*break*/, 7];
                    console.log("- \u0110\u00E3 t\u1ED3n t\u1EA1i: ".concat(uni.name));
                    _loop_1 = function (campusName) {
                        var campusExists;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    campusExists = existingUni.campuses.some(function (c) { return c.name === campusName; });
                                    if (!!campusExists) return [3 /*break*/, 2];
                                    return [4 /*yield*/, prisma.campus.create({
                                            data: {
                                                name: campusName,
                                                universityId: uni.id
                                            }
                                        })];
                                case 1:
                                    _d.sent();
                                    console.log("  + \u0110\u00E3 th\u00EAm c\u01A1 s\u1EDF m\u1EDBi: ".concat(campusName));
                                    _d.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, _b = uni.campuses;
                    _c.label = 3;
                case 3:
                    if (!(_a < _b.length)) return [3 /*break*/, 6];
                    campusName = _b[_a];
                    return [5 /*yield**/, _loop_1(campusName)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _a++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7: 
                // Tạo mới hoàn toàn
                return [4 /*yield*/, prisma.university.create({
                        data: {
                            id: uni.id,
                            name: uni.name,
                            emailDomains: [uni.domain],
                            campuses: { create: uni.campuses.map(function (name) { return ({ name: name }); }) },
                        },
                    })];
                case 8:
                    // Tạo mới hoàn toàn
                    _c.sent();
                    console.log("- T\u1EA1o m\u1EDBi tr\u01B0\u1EDDng: ".concat(uni.name));
                    _c.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10:
                    console.log('[SUCCESS] Đã cập nhật xong dữ liệu các trường đại học!');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error).finally(function () { return prisma.$disconnect(); });
