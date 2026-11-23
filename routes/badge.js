const express = require('express');
const { Badge, UserBadge, RoutineLog } = require('../models');

const router = express.Router();

// 1. 새 배지 도감 등록 (POST /badge/create)
router.post('/create', async (req, res, next) => {
    try {
        const badge = await Badge.create({
            name: req.body.name,
            description: req.body.description || '',
            requiredCount: req.body.requiredCount || 1
        });
        res.status(201).json(badge);
    } catch (err) {
        next(err);
    }
});

// 2. 전체 배지 도감 목록 조회 (GET /badge)
router.get('/', async (req, res, next) => {
    try {
        const badges = await Badge.findAll();
        res.status(200).json(badges);
    } catch (err) {
        next(err);
    }
});

// 3. [핵심 DB 연동] 실천 횟수 검증 후 배지 획득 (POST /badge/:id/claim)
router.post('/:id/claim', async (req, res, next) => {
    try {
        const badge = await Badge.findOne({ where: { id: req.params.id } });
        if (!badge) return res.status(404).json({ message: '존재하지 않는 배지입니다.' });

        // RoutineLog 테이블에서 해당 유저의 'DONE' 횟수 카운트
        const doneCount = await RoutineLog.count({
            where: { userId: req.body.userId, status: 'DONE' }
        });

        if (doneCount < badge.requiredCount) {
            return res.status(400).json({
                message: `실천 횟수가 부족합니다. (현재: ${doneCount}회 / 필요: ${badge.requiredCount}회)`
            });
        }

        const userBadge = await UserBadge.create({
            userId: req.body.userId,
            badgeId: badge.id,
            isEquipped: false
        });
        res.status(201).json(userBadge);
    } catch (err) {
        next(err);
    }
});

// 4. 특정 유저가 획득한 배지 목록 조회 (GET /badge/user/:userId)
router.get('/user/:userId', async (req, res, next) => {
    try {
        const userBadges = await UserBadge.findAll({
            where: { userId: req.params.userId },
            include: [{ model: Badge }]
        });
        res.status(200).json(userBadges);
    } catch (err) {
        next(err);
    }
});

// 5. 대표 배지 장착 상태 변경 (PATCH /badge/equip/:userBadgeId)
router.patch('/equip/:userBadgeId', async (req, res, next) => {
    try {
        await UserBadge.update({
            isEquipped: req.body.isEquipped
        }, {
            where: { id: req.params.userBadgeId }
        });
        const updated = await UserBadge.findOne({ where: { id: req.params.userBadgeId } });
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
});

// 6. 배지 삭제 (DELETE /badge/:id)
router.delete('/:id', async (req, res, next) => {
    try {
        await Badge.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: '배지 삭제 완료' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
