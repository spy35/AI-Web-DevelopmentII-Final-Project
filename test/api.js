const request = require('supertest');
const assert = require('assert');
const app = require('../app');
const { sequelize } = require('../models');

describe('API Integration Test: [전체 라우터 및 DB 연동 검증]', () => {
    let routineId;
    let logId;
    let challengeId;
    let commentId;
    let badgeId;
    let userBadgeId;

    // 테스트 시작 전 DB 초기화 및 기본 유저 2명 생성
    before(async () => {
        await sequelize.sync({ force: true });
        await request(app).post('/user/create').send({ id: 'user1', name: '홍길동', description: '열정 만수르' });
        await request(app).post('/user/create').send({ id: 'user2', name: '김철수', description: '꾸준함의 대명사' });
    });

    // =========================================================================
    // [라우터 1] /routine (개인 루틴 관리 - API 7개 테스트)
    // =========================================================================
    describe('1. API Test: [Routine 라우터]', () => {
        it('1-1. POST /routine/create - 새로운 루틴 생성', done => {
            request(app)
                .post('/routine/create')
                .send({
                    userId: 'user1',
                    title: '매일 물 2L 마시기',
                    category: '건강',
                    targetDays: '월,화,수,목,금'
                })
                .expect(res => {
                    routineId = res.body.id;
                    assert.strictEqual(res.body.title, '매일 물 2L 마시기');
                })
                .expect(201, done);
        });

        it('1-2. GET /routine - 전체 활성 루틴 목록 조회', done => {
            request(app)
                .get('/routine')
                .expect(res => {
                    assert.strictEqual(Array.isArray(res.body), true);
                    assert.strictEqual(res.body.length, 1);
                })
                .expect(200, done);
        });

        it('1-3. GET /routine/user/:userId - 특정 유저의 루틴 목록 조회', done => {
            request(app)
                .get('/routine/user/user1')
                .expect(res => {
                    assert.strictEqual(res.body[0].userId, 'user1');
                })
                .expect(200, done);
        });

        it('1-4. GET /routine/:id - 특정 루틴 상세 조회 (RoutineLog JOIN)', done => {
            request(app)
                .get(`/routine/${routineId}`)
                .expect(res => {
                    assert.strictEqual(res.body.id, routineId);
                    assert.strictEqual(Array.isArray(res.body.RoutineLogs), true);
                })
                .expect(200, done);
        });

        it('1-5. PUT /routine/:id - 루틴 정보 수정', done => {
            request(app)
                .put(`/routine/${routineId}`)
                .send({
                    title: '매일 물 3L 마시기(수정)',
                    category: '건강',
                    targetDays: '매일'
                })
                .expect(res => {
                    assert.strictEqual(res.body.title, '매일 물 3L 마시기(수정)');
                })
                .expect(200, done);
        });

        it('1-6. PATCH /routine/:id/archive - 루틴 보관 상태 변경', done => {
            request(app)
                .patch(`/routine/${routineId}/archive`)
                .send({ isArchived: true })
                .expect(200, done);
        });

        it('1-7. DELETE /routine/:id - 임시 루틴 생성 후 삭제 테스트', async () => {
            const temp = await request(app)
                .post('/routine/create')
                .send({
                    userId: 'user1',
                    title: '삭제 테스트용 루틴',
                    category: '운동',
                    targetDays: '주말'
                });
            assert.strictEqual(temp.statusCode, 201);
            const delRes = await request(app).delete(`/routine/${temp.body.id}`);
            assert.strictEqual(delRes.statusCode, 200);
        });
    });

    // =========================================================================
    // [라우터 2] /log (일일 실천 기록 및 통계 - API 6개 테스트)
    // =========================================================================
    describe('2. API Test: [Log 라우터]', () => {
        it('2-1. POST /log/create - 일일 루틴 실천 기록 생성 (2건 등록)', async () => {
            // 배지 획득 테스트를 위해 DONE 기록 2건 생성
            const res1 = await request(app)
                .post('/log/create')
                .send({
                    routineId: routineId,
                    userId: 'user1',
                    checkDate: '2026-11-08',
                    status: 'DONE',
                    memo: '1일차 성공'
                });
            assert.strictEqual(res1.statusCode, 201);

            const res2 = await request(app)
                .post('/log/create')
                .send({
                    routineId: routineId,
                    userId: 'user1',
                    checkDate: '2026-11-09',
                    status: 'DONE',
                    memo: '2일차 성공'
                });
            assert.strictEqual(res2.statusCode, 201);
            logId = res2.body.id;
        });

        it('2-2. GET /log/daily/:date - 특정 날짜 실천 기록 + 루틴 제목 JOIN 조회', done => {
            request(app)
                .get('/log/daily/2026-11-09')
                .expect(res => {
                    assert.strictEqual(res.body.length, 1);
                    assert.strictEqual(res.body[0].Routine.title, '매일 물 3L 마시기(수정)');
                })
                .expect(200, done);
        });

        it('2-3. GET /log/user/:userId - 특정 유저의 전체 실천 기록 + 루틴 정보 JOIN 조회', done => {
            request(app)
                .get('/log/user/user1')
                .expect(res => {
                    assert.strictEqual(res.body.length, 2);
                    assert.strictEqual(res.body[0].userId, 'user1');
                })
                .expect(200, done);
        });

        it('2-4. GET /log/stats/:userId - 특정 유저의 성공/실패 횟수 통계 조회', done => {
            request(app)
                .get('/log/stats/user1')
                .expect(res => {
                    assert.strictEqual(res.body.doneCount, 2);
                    assert.strictEqual(res.body.failCount, 0);
                })
                .expect(200, done);
        });

        it('2-5. PUT /log/:id - 실천 기록 메모 수정', done => {
            request(app)
                .put(`/log/${logId}`)
                .send({ status: 'DONE', memo: '2일차 완벽 성공!' })
                .expect(res => {
                    assert.strictEqual(res.body.memo, '2일차 완벽 성공!');
                })
                .expect(200, done);
        });

        it('2-6. DELETE /log/:id - 임시 기록 생성 후 삭제 테스트', async () => {
            const temp = await request(app)
                .post('/log/create')
                .send({ routineId, userId: 'user1', checkDate: '2026-11-10', status: 'FAIL' });
            const delRes = await request(app).delete(`/log/${temp.body.id}`);
            assert.strictEqual(delRes.statusCode, 200);
        });
    });

    // =========================================================================
    // [라우터 3] /challenge (그룹 챌린지 및 랭킹 - API 6개 테스트)
    // =========================================================================
    describe('3. API Test: [Challenge 라우터]', () => {
        it('3-1. POST /challenge/create - 그룹 챌린지 개설', done => {
            request(app)
                .post('/challenge/create')
                .send({
                    creatorId: 'user1',
                    title: '미라클 모닝 챌린지',
                    description: '아침 7시 기상 인증'
                })
                .expect(res => {
                    challengeId = res.body.id;
                    assert.strictEqual(res.body.title, '미라클 모닝 챌린지');
                })
                .expect(201, done);
        });

        it('3-2. GET /challenge - 전체 챌린지 목록 조회', done => {
            request(app)
                .get('/challenge')
                .expect(res => {
                    assert.strictEqual(res.body.length, 1);
                })
                .expect(200, done);
        });

        it('3-3. POST /challenge/:id/join - 챌린지 참가 신청 (user1, user2 참가)', async () => {
            const res1 = await request(app).post(`/challenge/${challengeId}/join`).send({ userId: 'user1' });
            const res2 = await request(app).post(`/challenge/${challengeId}/join`).send({ userId: 'user2' });
            assert.strictEqual(res1.statusCode, 201);
            assert.strictEqual(res2.statusCode, 201);
        });

        it('3-4. PATCH /challenge/:id/score - 참가자 달성 점수 업데이트', done => {
            request(app)
                .patch(`/challenge/${challengeId}/score`)
                .send({ userId: 'user1', addScore: 50 })
                .expect(res => {
                    assert.strictEqual(res.body.score, 50);
                })
                .expect(200, done);
        });

        it('3-5. GET /challenge/:id/ranking - 달성 점수순 랭킹 조회 (User JOIN)', done => {
            request(app)
                .get(`/challenge/${challengeId}/ranking`)
                .expect(res => {
                    assert.strictEqual(res.body[0].userId, 'user1');
                    assert.strictEqual(res.body[0].score, 50);
                })
                .expect(200, done);
        });

        it('3-6. DELETE /challenge/:id/leave/:userId - 챌린지 중도 탈퇴', done => {
            request(app)
                .delete(`/challenge/${challengeId}/leave/user2`)
                .expect(200, done);
        });
    });

    // =========================================================================
    // [라우터 4] /comment (챌린지 응원 댓글 - API 6개 테스트)
    // =========================================================================
    describe('4. API Test: [Comment 라우터]', () => {
        it('4-1. POST /comment/create - 응원 댓글 작성', done => {
            request(app)
                .post('/comment/create')
                .send({
                    challengeId: challengeId,
                    userId: 'user1',
                    comment: '다들 끝까지 화이팅합시다!'
                })
                .expect(res => {
                    commentId = res.body.id;
                    assert.strictEqual(res.body.comment, '다들 끝까지 화이팅합시다!');
                })
                .expect(201, done);
        });

        it('4-2. GET /comment/challenge/:challengeId - 특정 챌린지 댓글 조회 (User JOIN)', done => {
            request(app)
                .get(`/comment/challenge/${challengeId}`)
                .expect(res => {
                    assert.strictEqual(res.body.length, 1);
                    assert.strictEqual(res.body[0].User.name, '홍길동');
                })
                .expect(200, done);
        });

        it('4-3. GET /comment/user/:userId - 특정 유저가 작성한 댓글 목록 조회 (Challenge JOIN)', done => {
            request(app)
                .get('/comment/user/user1')
                .expect(res => {
                    assert.strictEqual(res.body.length, 1);
                    assert.strictEqual(res.body[0].Challenge.title, '미라클 모닝 챌린지');
                })
                .expect(200, done);
        });

        it('4-4. PUT /comment/:id - 댓글 내용 수정', done => {
            request(app)
                .put(`/comment/${commentId}`)
                .send({ comment: '수정된 응원 댓글입니다!' })
                .expect(res => {
                    assert.strictEqual(res.body.comment, '수정된 응원 댓글입니다!');
                })
                .expect(200, done);
        });

        it('4-5. PATCH /comment/:id/like - 댓글 좋아요 1 증가', done => {
            request(app)
                .patch(`/comment/${commentId}/like`)
                .expect(res => {
                    assert.strictEqual(res.body.likes, 1);
                })
                .expect(200, done);
        });

        it('4-6. DELETE /comment/:id - 댓글 삭제', done => {
            request(app)
                .delete(`/comment/${commentId}`)
                .expect(200, done);
        });
    });

    // =========================================================================
    // [라우터 5] /badge (업적 및 배지 시스템 - API 6개 테스트)
    // =========================================================================
    describe('5. API Test: [Badge 라우터 - DB 조건 검증]', () => {
        it('5-1. POST /badge/create - 새로운 업적 배지 등록 (필요 실천 횟수: 2회)', done => {
            request(app)
                .post('/badge/create')
                .send({
                    name: '꾸준함의 시작',
                    description: '루틴 2회 이상 성공 시 획득',
                    requiredCount: 2
                })
                .expect(res => {
                    badgeId = res.body.id;
                    assert.strictEqual(res.body.requiredCount, 2);
                })
                .expect(201, done);
        });

        it('5-2. GET /badge - 전체 배지 도감 조회', done => {
            request(app)
                .get('/badge')
                .expect(res => {
                    assert.strictEqual(res.body.length, 1);
                })
                .expect(200, done);
        });

        it('5-3. POST /badge/:id/claim - 조건 미달 유저(user2) 배지 획득 요청 시 400 거절 확인', done => {
            request(app)
                .post(`/badge/${badgeId}/claim`)
                .send({ userId: 'user2' })
                .expect(400, done);
        });

        it('5-4. POST /badge/:id/claim - 조건 달성 유저(user1, DONE 2회) 배지 획득 성공', done => {
            request(app)
                .post(`/badge/${badgeId}/claim`)
                .send({ userId: 'user1' })
                .expect(res => {
                    userBadgeId = res.body.id;
                    assert.strictEqual(res.body.userId, 'user1');
                })
                .expect(201, done);
        });

        it('5-5. GET /badge/user/:userId - 유저가 획득한 배지 목록 조회 (Badge JOIN)', done => {
            request(app)
                .get('/badge/user/user1')
                .expect(res => {
                    assert.strictEqual(res.body.length, 1);
                    assert.strictEqual(res.body[0].Badge.name, '꾸준함의 시작');
                })
                .expect(200, done);
        });

        it('5-6. PATCH /badge/equip/:userBadgeId - 대표 배지 장착 설정', done => {
            request(app)
                .patch(`/badge/equip/${userBadgeId}`)
                .send({ isEquipped: true })
                .expect(res => {
                    assert.strictEqual(res.body.isEquipped, true);
                })
                .expect(200, done);
        });

        it('5-7. DELETE /badge/:id - 임시 배지 생성 후 삭제 테스트', async () => {
            const temp = await request(app)
                .post('/badge/create')
                .send({
                    name: '삭제 테스트용 배지',
                    description: '임시 배지',
                    requiredCount: 10
                });
            assert.strictEqual(temp.statusCode, 201);
            const delRes = await request(app).delete(`/badge/${temp.body.id}`);
            assert.strictEqual(delRes.statusCode, 200);
        });
    });
});
