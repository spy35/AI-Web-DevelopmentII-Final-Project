const express = require('express');
const { Comment, User, Challenge } = require('../models');

const router = express.Router();

// 1. 응원 댓글 작성 (POST /comment/create)
router.post('/create', async (req, res, next) => {
    try {
        const comment = await Comment.create({
            challengeId: req.body.challengeId,
            userId: req.body.userId,
            comment: req.body.comment,
            likes: 0
        });
        res.status(201).json(comment);
    } catch (err) {
        next(err);
    }
});

// 2. 특정 챌린지의 댓글 목록 + 작성자 이름 JOIN 조회 (GET /comment/challenge/:challengeId)
router.get('/challenge/:challengeId', async (req, res, next) => {
    try {
        const comments = await Comment.findAll({
            where: { challengeId: req.params.challengeId },
            include: [{ model: User, attributes: ['id', 'name'] }]
        });
        res.status(200).json(comments);
    } catch (err) {
        next(err);
    }
});

// 3. 특정 유저가 작성한 댓글 목록 + 챌린지 제목 JOIN 조회 (GET /comment/user/:userId)
router.get('/user/:userId', async (req, res, next) => {
    try {
        const comments = await Comment.findAll({
            where: { userId: req.params.userId },
            include: [{ model: Challenge, attributes: ['id', 'title'] }]
        });
        res.status(200).json(comments);
    } catch (err) {
        next(err);
    }
});

// 4. 댓글 내용 수정 (PUT /comment/:id)
router.put('/:id', async (req, res, next) => {
    try {
        await Comment.update({
            comment: req.body.comment
        }, {
            where: { id: req.params.id }
        });
        const updated = await Comment.findOne({ where: { id: req.params.id } });
        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
});

// 5. 댓글 좋아요 1 증가 (PATCH /comment/:id/like)
router.patch('/:id/like', async (req, res, next) => {
    try {
        const comment = await Comment.findOne({ where: { id: req.params.id } });
        if (!comment) return res.status(404).json({ message: '댓글 없음' });
        comment.likes += 1;
        await comment.save();
        res.status(200).json(comment);
    } catch (err) {
        next(err);
    }
});

// 6. 댓글 삭제 (DELETE /comment/:id)
router.delete('/:id', async (req, res, next) => {
    try {
        await Comment.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: '댓글 삭제 완료' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
