
(() => {
  const API_URL = 'https://asia-northeast1-fh-quiz-api.cloudfunctions.net/api/quiz';


  //quizデータの保持
  const gameState = {
    quizzes:[],
    currentIndex:0,
    numberOfCorrects:0
  }


  //DOM要素の取得
  const questionElement = document.getElementById('question');
  const resultElement = document.getElementById('result');
  const restartElement = document.getElementById('restart-button');
  const divElement = document.getElementById('button-wrapper'); 


  //startボタンを押して、次のクイズデータを取得する。
  questionElement.textContent = 'Now loading...';

  resultElement.textContent = '';

  restartElement.style.display = 'none';

  setTimeout(() => {
    questionElement.textContent = 'クイズを始める!';
    restartElement.textContent = 'Start';
    restartElement.style.display = 'block';
  }, 1000)


  const fetchQuizData = () => {
    fetch(API_URL)
      .then( response => {
        return response.json();
      })
      .then( data => {
        data.results.forEach((result, index) => {
          gameState.quizzes.push(result);
        })
      })
  }


  fetchQuizData();


  //restartボタンをクリックしたときの挙動
  restartElement.onclick = () => {
    if (10 - gameState.currentIndex > 0) {
      questionElement.textContent = 'Now loading...';
      restartElement.style.display = 'none';
      resultElement.textContent = '';
      setTimeout(() => {
        makeQuiz(gameState.quizzes[gameState.currentIndex]);
      }, 1000);
    } 
  }


  //クイズ中、一つの問いが終わり、次の問いに行く。
  const setNextQuiz = () => {
    questionElement.textContent = '';

    removeAllAnswers();

    if(10 - gameState.currentIndex > 0) {
      makeQuiz(gameState.quizzes[gameState.currentIndex]);
    } else if (10 - gameState.currentIndex <= 0) {
      finishQuiz();
    } 
  }


  //クイズが終わり、正答数を表示する。
  const finishQuiz = () => {
    if (gameState.numberOfCorrects === gameState.quizzes.length) {
      resultElement.innerHTML = `${gameState.numberOfCorrects}/${gameState.quizzes.length} corrects<div>全問正解おめでとう!!</div>`;
    } else if (gameState.numberOfCorrects === 0) {
      resultElement.innerHTML = `${gameState.numberOfCorrects}/${gameState.quizzes.length} corrects<div>今から勉強しよう！</div>`;
    } else {
      resultElement.innerHTML = `${gameState.numberOfCorrects}/${gameState.quizzes.length} corrects<div>まだいける！</div>`;
    }

    restartElement.style.display = 'block';

    restartElement.textContent = 'Restart';

    gameState.quizzes = [];

    gameState.currentIndex = 0;

    gameState.numberOfCorrects = 0;

    fetchQuizData();
  }


  //次の問題に行くとき、解答候補を全て消す。
  const removeAllAnswers = () => {
    const _answerSelections = document.querySelectorAll('.select-button');

    _answerSelections.forEach((element, index) => {
      divElement.removeChild(element);
    })
  }


  //解答を選び、正解か不正解か判定が出る。
  const makeQuiz = (quiz) => {
    questionElement.textContent = unescapeHTML(quiz.question);

    merge(quiz);

    const timer1 = setTimeout(() => { 
      questionElement.textContent = '時間切れ!!';
      removeAllAnswers();
    }, 10000)

    const timer2 = setTimeout(() => {       
      gameState.currentIndex++;
      setNextQuiz();
    }, 11000)

    const answerSelections = document.querySelectorAll('.select-button');

    answerSelections.forEach((_answerSelection, index) => {
      _answerSelection.addEventListener('click', event => {
        clearTimeout(timer1);
        clearTimeout(timer2);

        if(_answerSelection.textContent === unescapeHTML(quiz.correct_answer)) {
          gameState.numberOfCorrects++;
          alert('正解!!');
        } else {
          alert(`残念... (正解は ${unescapeHTML(quiz.correct_answer)})`);
        }

        gameState.currentIndex++;

        setNextQuiz();
      });
    });
  }


  // 正解・不正解の解答をシャッフルする。
  const merge = (quiz) => {
    const _incorrect_answers = [];

    quiz.incorrect_answers.forEach((incorrect_answer, index) => {
      _incorrect_answers.push(unescapeHTML(incorrect_answer));
    })

    _incorrect_answers.push(unescapeHTML(quiz.correct_answer));

    const shuffledArray = _incorrect_answers.slice();

    shuffle(shuffledArray);
  }


  const shuffle = (shuffledArray) => {
    for(let i = shuffledArray.length - 1; i > 0; i--){
      const r = Math.floor(Math.random() * (i + 1));
      let tmp = shuffledArray[i];
      shuffledArray[i] = shuffledArray[r];
      shuffledArray[r] = tmp;
    }
    
    shuffledArray.forEach((array, index) => {
      const answerSelection = document.createElement('button');
      answerSelection.setAttribute('class', 'select-button');
      answerSelection.textContent = array;
      const divElement = document.getElementById('button-wrapper');
      divElement.appendChild(answerSelection);
    });
  }


  //特殊文字を変換
  const unescapeHTML = (str) => {
    const div = document.createElement("div");
    div.innerHTML = str.replace(/</g,"&lt;")
                        .replace(/>/g,"&gt;")
                        .replace(/ /g, "&nbsp;")
                        .replace(/\r/g, "&#13;")
                        .replace(/\n/g, "&#10;");
    return div.textContent;
  }
})();