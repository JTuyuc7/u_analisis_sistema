import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Card } from '../entities/Card';

export class CardRepository {
  private repository: Repository<Card>;

  constructor() {
    this.repository = AppDataSource.getRepository(Card);
  }

  async createCard(cardData: Partial<Card>): Promise<Card> {
    // Check if account has reached card limit
    if (cardData.account) {
      const existingCards = await this.repository.count({
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
    return await this.repository.save(card);
  }

  async findByCardNumber(cardNumber: string): Promise<Card | null> {
    return await this.repository.findOne({
      where: { card_number: cardNumber },
      relations: ['account']
    });
  }

  async findByAccountId(accountId: number): Promise<Card[]> {
    return await this.repository.find({
      where: { account: { account_id: accountId } },
      relations: ['account']
    });
  }

  async updateCard(cardId: number, cardData: Partial<Card>): Promise<Card | null> {
    await this.repository.update(cardId, cardData);
    return await this.repository.findOne({
      where: { card_id: cardId },
      relations: ['account']
    });
  }

  async deleteCard(cardId: number): Promise<void> {
    await this.repository.delete(cardId);
  }

  async findById(cardId: number): Promise<Card | null> {
    return await this.repository.findOne({
      where: { card_id: cardId },
      relations: ['account']
    });
  }
}
