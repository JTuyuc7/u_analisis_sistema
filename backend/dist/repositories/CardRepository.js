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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRepository = void 0;
const data_source_1 = require("../data-source");
const Card_1 = require("../entities/Card");
class CardRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(Card_1.Card);
    }
    createCard(cardData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if account has reached card limit
            if (cardData.account) {
                const existingCards = yield this.repository.count({
                    where: {
                        account: { account_id: cardData.account.account_id },
                        status: 'active'
                    }
                });
                if (existingCards >= 2) {
                    throw new Error('Account has reached the maximum limit of 2 cards');
                }
            }
            const card = this.repository.create(cardData);
            return yield this.repository.save(card);
        });
    }
    findByCardNumber(cardNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.findOne({
                where: { card_number: cardNumber },
                relations: ['account']
            });
        });
    }
    findByAccountId(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.find({
                where: { account: { account_id: accountId } },
                relations: ['account']
            });
        });
    }
    updateCard(cardId, cardData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repository.update(cardId, cardData);
            return yield this.repository.findOne({
                where: { card_id: cardId },
                relations: ['account']
            });
        });
    }
    deleteCard(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repository.delete(cardId);
        });
    }
    findById(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.findOne({
                where: { card_id: cardId },
                relations: ['account']
            });
        });
    }
}
exports.CardRepository = CardRepository;
