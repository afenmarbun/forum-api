import NewThread from '../NewThread.js';

describe('a NewThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'sebuah thread',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 'sebuah thread',
      body: ['sebuah body'],
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread object correctly', () => {
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body',
    };

    const { title, body } = new NewThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
