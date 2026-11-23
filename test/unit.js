const assert = require('assert');
const { sequelize, User, Routine, RoutineLog, Challenge, Participant, Comment, Badge, UserBadge } = require('../models');

describe('ORM Unit Test: [Models]', () => {
    before(async () => {
        // 단위 테스트 시작 전 테이블 초기화
        await sequelize.sync({ force: true });
    });

    it('1. User.create() & User.findOne()', async () => {
        await User.create({ id: 'unit_user', name: '단위테스트유저', description: '테스트 설명' });
        const user = await User.findOne({ where: { id: 'unit_user' } });
        assert.strictEqual(user.name, '단위테스트유저');
    });

    it('2. Routine.create() & RoutineLog.create()', async () => {
        const routine = await Routine.create({
            userId: 'unit_user',
            title: '아침 스트레칭',
            category: '운동',
            targetDays: '월,수,금'
        });
        const log = await RoutineLog.create({
            routineId: routine.id,
            userId: 'unit_user',
            checkDate: '2026-11-09',
            status: 'DONE',
            memo: '상쾌함'
        });
        assert.strictEqual(routine.title, '아침 스트레칭');
        assert.strictEqual(log.status, 'DONE');
    });

    it('3. Challenge, Participant, Comment 연동 생성', async () => {
        const challenge = await Challenge.create({
            creatorId: 'unit_user',
            title: '30일 독서 챌린지',
            description: '하루 10페이지 읽기'
        });
        const participant = await Participant.create({
            challengeId: challenge.id,
            userId: 'unit_user',
            score: 10
        });
        const comment = await Comment.create({
            challengeId: challenge.id,
            userId: 'unit_user',
            comment: '오늘도 완독!'
        });
        assert.strictEqual(participant.score, 10);
        assert.strictEqual(comment.comment, '오늘도 완독!');
    });

    it('4. Badge & UserBadge 연동 생성', async () => {
        const badge = await Badge.create({
            name: '첫걸음 배지',
            description: '루틴 1회 달성',
            requiredCount: 1
        });
        const userBadge = await UserBadge.create({
            userId: 'unit_user',
            badgeId: badge.id,
            isEquipped: true
        });
        assert.strictEqual(userBadge.isEquipped, true);
    });
});
