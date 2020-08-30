import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const checkTransactionId = await transactionsRepository.findOne(id);

    if (!checkTransactionId) {
      throw new AppError('Transaction not found.', 400);
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
