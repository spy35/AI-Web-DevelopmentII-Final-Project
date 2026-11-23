const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models');

const userRouter = require('./routes/user');
const routineRouter = require('./routes/routine');
const logRouter = require('./routes/log');
const challengeRouter = require('./routes/challenge');
const commentRouter = require('./routes/comment');
const badgeRouter = require('./routes/badge');

const app = express();
app.set('port', process.env.PORT || 5000);

// 서버 실행 시 MySQL project DB에 테이블 자동 생성
sequelize.sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결 및 테이블 동기화 성공');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use(express.json());
// 정적 파일 제공 (public 폴더 안의 HTML을 웹 브라우저에서 접근 가능하게 설정)
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// 라우터 연결 (회원 제외 핵심 라우터 5개)
app.use('/user', userRouter);
app.use('/routine', routineRouter);
app.use('/log', logRouter);
app.use('/challenge', challengeRouter);
app.use('/comment', commentRouter);
app.use('/badge', badgeRouter);

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

if (require.main === module) {
    app.listen(app.get('port'), () => {
        console.log(app.get('port'), '번 포트에서 대기 중');
    });
}

module.exports = app;
