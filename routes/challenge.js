const express = require('express');
const { Challenge, Participant, User } = require('../models');

const router = express.Router();

// 1. 그룹 챌린지 개설 (POST /challenge/create)
router.post('/create', async (req, res, next) => {
    try {
        const challenge = await Challenge.create({
            creatorId: req.body.creatorId,
            title: req.body.title,
            description: req.body.description || ''
        });
        res.status(201).json(challenge);
    } catch (err) {
        next(err);
    }
});

// 2. 전체 챌린지 목록 조회 (GET /challenge)
router.get('/', async (req, res, next) => {
    try {
        const challenges = await Challenge.findAll({
            include: [{ model: Participant }]
        });
        res.status(200).json(challenges);
    } catch (err) {
        next(err);
    }
});

// 3. 챌린지 참가 신청 (POST /challenge/:id/join)
router.post('/:id/join', async (req, res, next) => {
    try {
        const participant = await Participant.create({
            challengeId: req.params.id,
            userId: req.body.userId,
            score: 0
        });
        res.status(201).json(participant);
    } catch (err) {
        next(err);
    }
});

// 4. 참가자 챌린지 달성 점수 업데이트 (PATCH /challenge/:id/score)
router.patch('/:id/score', async (req, res, next) => {
    try {
        const participant = await Participant.findOne({
            where: { challengeId: req.params.id, userId: req.body.userId }
        });
        if (!participant) {
            return res.status(404).json({ message: '참가자를 찾을 수 없습니다.' });
        }
        participant.score += (req.body.addScore || 10);
        await participant.save();
        res.status(200).json(participant);
    } catch (err) {
        next(err);
    }
});

// 5. 특정 챌린지 달성도 랭킹 조회 (GET /challenge/:id/ranking)
router.get('/:id/ranking', async (req, res, next) => {
    try {
        const ranking = await Participant.findAll({
            where: { challengeId: req.params.id },
            include: [{ model: User, attributes: ['id', 'name'] }],
            order: [['score', 'DESC']]
        });
        res.status(200).json(ranking);
    } catch (err) {
        next(err);
    }
});

// 6. 챌린지 참가 취소/탈퇴 (DELETE /challenge/:id/leave/:userId)
router.delete('/:id/leave/:userId', async (req, res, next) => {
    try {
        await Participant.destroy({
            where: { challengeId: req.params.id, userId: req.params.userId }
        });
        res.status(200).json({ message: '챌린지 탈퇴 완료' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
