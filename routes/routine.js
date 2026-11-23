const express = require('express');
const { Routine, RoutineLog } = require('../models');

const router = express.Router();

// 1. 루틴 생성 (POST /routine/create)
router.post('/create', async (req, res, next) => {
    try {
        const routine = await Routine.create({
            userId: req.body.userId,
            title: req.body.title,
            category: req.body.category || '건강',
            targetDays: req.body.targetDays,
        });
        res.status(201).json(routine);
    } catch (err) {
        next(err);
    }
});

// 2. 전체 활성 루틴 목록 조회 (GET /routine)
router.get('/', async (req, res, next) => {
    try {
        const routines = await Routine.findAll({
            where: { isArchived: false }
        });
        res.status(200).json(routines);
    } catch (err) {
        next(err);
    }
});

// 3. 특정 유저의 루틴 목록 조회 (GET /routine/user/:userId)
router.get('/user/:userId', async (req, res, next) => {
    try {
        const routines = await Routine.findAll({
            where: { userId: req.params.userId }
        });
        res.status(200).json(routines);
    } catch (err) {
        next(err);
    }
});

// 4. 특정 루틴 상세 + 실천 기록 JOIN 조회 (GET /routine/:id)
router.get('/:id', async (req, res, next) => {
    try {
        const routine = await Routine.findOne({
            where: { id: req.params.id },
            include: [{ model: RoutineLog }]
        });
        res.status(200).json(routine);
    } catch (err) {
        next(err);
    }
});

// 5. 루틴 정보 수정 (PUT /routine/:id)
router.put('/:id', async (req, res, next) => {
    try {
        await Routine.update({
            title: req.body.title,
            category: req.body.category,
            targetDays: req.body.targetDays,
        }, {
            where: { id: req.params.id }
        });
        const updated = await Routine.findOne({ where: { id: req.params.id } });
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
});

// 6. 루틴 보관 상태 변경 (PATCH /routine/:id/archive)
router.patch('/:id/archive', async (req, res, next) => {
    try {
        await Routine.update({
            isArchived: req.body.isArchived
        }, {
            where: { id: req.params.id }
        });
        res.status(200).json({ message: '보관 상태 변경 완료' });
    } catch (err) {
        next(err);
    }
});

// 7. 루틴 삭제 (DELETE /routine/:id)
router.delete('/:id', async (req, res, next) => {
    try {
        await Routine.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: '루틴 삭제 완료' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
