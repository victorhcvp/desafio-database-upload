import { getCustomRepository, getRepository } from 'typeorm';
// import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type must be income or outcome.', 400);
    }
    if (typeof category !== 'string') {
      throw new AppError('Category must be a string.', 400);
    }
    if (typeof title !== 'string') {
      throw new AppError('Title must be a string.', 400);
    }
    if (typeof value !== 'number') {
      throw new AppError('Value must be a number.', 400);
    }

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      if (balance.total - value < 0) {
        throw new AppError('Insufficient funds.', 400);
      }
    }

    const categoryObj = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    let transaction;

    if (categoryObj) {
      transaction = transactionsRepository.create({
        title,
        type,
        value,
        category_id: categoryObj.id,
      });
    } else {
      const newCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(newCategory);

      transaction = transactionsRepository.create({
        title,
        type,
        value,
        category_id: newCategory.id,
      });
    }

    if (!transaction) {
      throw new AppError('No transaction to save.', 400);
    }

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
