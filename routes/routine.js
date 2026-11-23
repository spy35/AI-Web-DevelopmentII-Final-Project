const express = require('express');
const { Routine, RoutineLog } = require('../models');

const router = express.Router();

// 1. 루틴 생성 (POST /routine/create)
router.post('/create', async (req, res, next) => {
    try {
        const routine = await Routine.create({
            userId: req.body.userId, // 누가 만든 루틴인지(외래키)
            title: req.body.title, // 루틴 제목
            category: req.body.category || '건강', // 카테고리가 안넘어오면 기본값은 건강
            targetDays: req.body.targetDays, // 목표 요일
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
            where: { isArchived: false } // 보관되지 않은 루틴만 필터링
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
            where: { userId: req.params.userId } // URL의 :userId 값과 일치하는 루틴만 조회
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
            where: { id: req.params.id }, // 루틴 고유 번호로 1건 조회
            include: [{ model: RoutineLog }] // 연결된 routine_logs 테이블 배열
        });
        res.status(200).json(routine);
    } catch (err) {
        next(err);
    }
});

// 5. 루틴 정보 수정 (PUT /routine/:id)
router.put('/:id', async (req, res, next) => {
    try { // 해당 id의 루틴 정보 업데이트
        await Routine.update({
            title: req.body.title,
            category: req.body.category,
            targetDays: req.body.targetDays,
        }, {
            where: { id: req.params.id }
        }); // 수정이 반영된 데이터를 다시 조회해서 클라이언트에 반환
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
            isArchived: req.body.isArchived // true 보관 또는 false 활성
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
