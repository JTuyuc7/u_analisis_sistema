export interface Card {
  card_id: number;
  card_number: string;
  expiration_date: string;
  status: string;
}

export interface Account {
  account_id: number;
  account_number: string;
  account_type: string;
  account_name: string;
  balance: number;
  status: string;
  created_at: string;
  card_count: number;
  cards: Card[];
}
