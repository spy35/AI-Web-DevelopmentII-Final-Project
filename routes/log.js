const express = require('express');
const { RoutineLog, Routine } = require('../models');

const router = express.Router();

// 1. 일일 실천 기록 생성 (POST /log/create)
router.post('/create', async (req, res, next) => {
    try {
        const log = await RoutineLog.create({
            routineId: req.body.routineId,
            userId: req.body.userId,
            checkDate: req.body.checkDate,
            status: req.body.status || 'DONE',
            memo: req.body.memo || ''
        });
        res.status(201).json(log);
    } catch (err) {
        next(err);
    }
});

// 2. 특정 날짜의 실천 기록 + 루틴 정보 JOIN 조회 (GET /log/daily/:date)
router.get('/daily/:date', async (req, res, next) => {
    try {
        const logs = await RoutineLog.findAll({
            where: { checkDate: req.params.date },
            include: [{ model: Routine, attributes: ['title', 'category'] }]
        });
        res.status(200).json(logs);
    } catch (err) {
        next(err);
    }
});

// 3. 특정 유저의 전체 실천 기록 + 루틴 정보 JOIN 조회 (GET /log/user/:userId)
router.get('/user/:userId', async (req, res, next) => {
    try {
        const logs = await RoutineLog.findAll({
            where: { userId: req.params.userId },
            include: [{ model: Routine, attributes: ['title', 'category'] }]
        });
        res.status(200).json(logs);
    } catch (err) {
        next(err);
    }
});

// 4. 특정 유저의 실천 성공(DONE)/실패(FAIL) 통계 조회 (GET /log/stats/:userId)
router.get('/stats/:userId', async (req, res, next) => {
    try {
        const doneCount = await RoutineLog.count({
            where: { userId: req.params.userId, status: 'DONE' }
        });
        const failCount = await RoutineLog.count({
            where: { userId: req.params.userId, status: 'FAIL' }
        });
        res.status(200).json({
            userId: req.params.userId,
            doneCount,
            failCount,
            totalCount: doneCount + failCount
        });
    } catch (err) {
        next(err);
    }
});

// 5. 실천 기록 메모 및 상태 수정 (PUT /log/:id)
router.put('/:id', async (req, res, next) => {
    try {
        await RoutineLog.update({
            status: req.body.status,
            memo: req.body.memo
        }, {
            where: { id: req.params.id }
        });
        const updated = await RoutineLog.findOne({ where: { id: req.params.id } });
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
});

// 6. 실천 기록 삭제 (DELETE /log/:id)
router.delete('/:id', async (req, res, next) => {
    try {
        await RoutineLog.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: '실천 기록 삭제 완료' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
