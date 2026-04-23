class ThreadRepository {
  async addThread(owner, newThread) {
    void owner;
    void newThread;
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyThreadExists(threadId) {
    void threadId;
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getThreadById(threadId) {
    void threadId;
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

export default ThreadRepository;
