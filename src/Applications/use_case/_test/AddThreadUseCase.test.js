import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };
    const owner = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn(() => Promise.resolve(new AddedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    })));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(owner, useCasePayload);

    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    }));
    expect(mockThreadRepository.addThread).toBeCalledWith(owner, new NewThread(useCasePayload));
  });

  it('should throw error when use case payload is invalid', async () => {
    const invalidPayload = {
      title: 'sebuah thread',
    };
    const owner = 'user-123';
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn();

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    await expect(addThreadUseCase.execute(owner, invalidPayload))
      .rejects
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(mockThreadRepository.addThread).not.toBeCalled();
  });
});
