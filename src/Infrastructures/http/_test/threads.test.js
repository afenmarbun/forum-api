import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';

describe('Threads endpoints', () => {
  const registerAndLogin = async (app, {
    username,
    password,
    fullname,
  }) => {
    await request(app).post('/users').send({ username, password, fullname });
    const loginResponse = await request(app).post('/authentications').send({ username, password });

    return loginResponse.body.data.accessToken;
  };

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app, {
        username: 'dicodingthreadone',
        password: 'secret',
        fullname: 'Dicoding Thread',
      });

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual('sebuah thread');
      expect(response.body.data.addedThread.owner).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeTruthy();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app, {
        username: 'dicodingthreadtwo',
        password: 'secret',
        fullname: 'Dicoding Thread 2',
      });

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
        });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeTruthy();
    });
  });

  describe('when POST /threads/:threadId/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app, {
        username: 'dicodingcommentone',
        password: 'secret',
        fullname: 'Dicoding Comment',
      });
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });

      const response = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment.id).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual('sebuah komentar');
      expect(response.body.data.addedComment.owner).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app, {
        username: 'dicodingcommenttwo',
        password: 'secret',
        fullname: 'Dicoding Comment 2',
      });

      const response = await request(app)
        .post('/threads/thread-not-found/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeTruthy();
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId', () => {
    it('should response 200 and soft delete comment', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app, {
        username: 'dicodingdeletecomment',
        password: 'secret',
        fullname: 'Dicoding Delete Comment',
      });
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });
      const commentResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });

      const response = await request(app)
        .delete(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentResponse.body.data.addedComment.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when user not comment owner', async () => {
      const app = await createServer(container);
      const ownerToken = await registerAndLogin(app, {
        username: 'dicodingownercomment',
        password: 'secret',
        fullname: 'Dicoding Owner Comment',
      });
      const otherToken = await registerAndLogin(app, {
        username: 'dicodingothercomment',
        password: 'secret',
        fullname: 'Dicoding Other Comment',
      });
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });
      const commentResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          content: 'sebuah komentar',
        });

      const response = await request(app)
        .delete(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentResponse.body.data.addedComment.id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeTruthy();
    });
  });

  describe('when POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app, {
        username: 'dicodingreplyone',
        password: 'secret',
        fullname: 'Dicoding Reply',
      });
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });
      const commentResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });

      const response = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentResponse.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah balasan',
        });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply.id).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual('sebuah balasan');
      expect(response.body.data.addedReply.owner).toBeDefined();
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 200 and soft delete reply', async () => {
      const app = await createServer(container);
      const accessToken = await registerAndLogin(app, {
        username: 'dicodingdeletereply',
        password: 'secret',
        fullname: 'Dicoding Delete Reply',
      });
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });
      const commentResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });
      const replyResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentResponse.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah balasan',
        });

      const response = await request(app)
        .delete(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentResponse.body.data.addedComment.id}/replies/${replyResponse.body.data.addedReply.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('when GET /threads/:threadId', () => {
    it('should response 200 and return thread detail with deleted comment and reply placeholder', async () => {
      const app = await createServer(container);
      const ownerToken = await registerAndLogin(app, {
        username: 'dicodingdetailowner',
        password: 'secret',
        fullname: 'Dicoding Detail Owner',
      });
      const otherToken = await registerAndLogin(app, {
        username: 'johndoedetailowner',
        password: 'secret',
        fullname: 'Johndoe Detail Owner',
      });
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });
      const commentOwnerResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: 'komentar pertama',
        });
      const deletedCommentResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          content: 'komentar kedua',
        });
      await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentOwnerResponse.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          content: 'balasan pertama',
        });
      const deletedReplyResponse = await request(app)
        .post(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentOwnerResponse.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: 'balasan kedua',
        });

      await request(app)
        .delete(`/threads/${threadResponse.body.data.addedThread.id}/comments/${deletedCommentResponse.body.data.addedComment.id}`)
        .set('Authorization', `Bearer ${ownerToken}`);
      await request(app)
        .delete(`/threads/${threadResponse.body.data.addedThread.id}/comments/${commentOwnerResponse.body.data.addedComment.id}/replies/${deletedReplyResponse.body.data.addedReply.id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      const response = await request(app).get(`/threads/${threadResponse.body.data.addedThread.id}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread.id).toEqual(threadResponse.body.data.addedThread.id);
      expect(response.body.data.thread.title).toEqual('sebuah thread');
      expect(response.body.data.thread.body).toEqual('sebuah body thread');
      expect(response.body.data.thread.username).toEqual('dicodingdetailowner');
      expect(response.body.data.thread.comments).toHaveLength(2);
      expect(response.body.data.thread.comments[0].content).toEqual('komentar pertama');
      expect(response.body.data.thread.comments[0].replies).toHaveLength(2);
      expect(response.body.data.thread.comments[0].replies[0].content).toEqual('balasan pertama');
      expect(response.body.data.thread.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');
      expect(response.body.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);

      const response = await request(app).get('/threads/thread-not-found');

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeTruthy();
    });
  });
});
