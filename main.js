/* ************************** constant variables ************************** */
const prefixID = "letter-";
const REGEX_ALFABET = /[a-z]/i;
const inputs = document.getElementsByTagName("input");
const solveButton = document.getElementById("solve-button");
const resetButton = document.getElementById("reset-button");

/* ************************** FUNCTIONS ************************** */
const ke = (angka) => prefixID.concat(angka); // return "letter-1", "letter-2", etc
const loadFunction = () => inputs[ke(1)].focus();

const HandleKeyDown = (event) => {
  console.log("handlekeydown");
  // cegah user mengisi input yang bukan huruf, backspace atau tab
  const keyStroke = event.key.toLowerCase(); // "a", "b", "backspace", "tab", etc
  const currentHexagon = parseInt(document.activeElement.id.at(-1)); // 1, 2, 3, etc

  /*
  PENJELASAN if tab:
    kalau sekarang bukan di hexagon yang terakhir, pindah ke hexagon selanjutnya.
    kalau sekarang di hexagon terakhir, cek:
    - kalau ada hexagon yang belum terisi, pindah ke hexagon pertama
    - kalau semua hexagon sudah terisi, pindah ke button

  PENJELASAN IF bukan backspace: cegah value input sesuai menjadi keyStroke melalui event.preventDefault()
  */
  if (keyStroke.length > 1) {
    if (keyStroke === "tab") {
      event.preventDefault();
      if (currentHexagon !== 7) {
        return inputs[ke(currentHexagon + 1)].focus();
      } else {
        for (let i = 1; i <= inputs.length; i++) {
          if (inputs[ke(i)].value === "") {
            return inputs[ke(1)].focus();
          }
        }
        return solveButton.focus();
      }
    } else if (keyStroke !== "backspace") {
      return event.preventDefault();
    }
  }
  if (!REGEX_ALFABET.test(keyStroke)) return event.preventDefault();
};

const HandleKeyUp = (event) => {
  console.log("handlekeyup");
  const currentElement = document.activeElement;
  const maxValueLength = 1;
  if (currentElement.value.length > maxValueLength) {
    currentElement.value = currentElement.value.substring(0, maxValueLength);
  }

  const keyStroke = event.key.toLowerCase();
  const currentHexagon = parseInt(document.activeElement.id.at(-1));
  // backspace. pindah ke hexagon sebelumnya. kalo sudah di hexagon pertama, pindah ke hexagon terakhir.
  if (keyStroke === "backspace") {
    if (currentHexagon !== 1) {
      inputs[ke(currentHexagon - 1)].focus();
    } else {
      inputs[ke(inputs.length)].focus();
    }
    // huruf. pindah ke hexagon setelahnya. kalo sudah di hexagon terakhir, pindah ke solve button.
  } else if (keyStroke.length === 1 && REGEX_ALFABET.test(keyStroke)) {
    if (currentHexagon !== inputs.length) {
      inputs[ke(currentHexagon + 1)].focus();
    } else {
      solveButton.focus();
    }
  }
};

const resetPage = () => (window.location.href = window.location.href);

/* ************************** SOLVER FUNCTIONS START ************************** */
const GetLetters = () => {
  const specificLetters = [];
  for (let i = 1; i <= inputs.length; i++) {
    inputValue = inputs[ke(i)].value;
    if (inputValue === "") {
      alert("Fill out the hexagons❗");
      return false;
    }
    if (inputValue.length === 1 && REGEX_ALFABET.test(inputValue)) {
      if (i == 1) continue;
      specificLetters.push(inputValue.toLowerCase());
    }
  }
  // kalau sampai sini berarti semua hexagon sudah ada isinya
  const centerLetter = inputs[ke(1)].value.toLowerCase();

  return { specificLetters: specificLetters, centerLetter: centerLetter };
};

const SpellingBeeSolver = (wordList, centerLetter, specificLetters) => {
  const wordsWithCenterLetter = [];
  const pangrams = [];
  const finalWordList = [];
  // filter pertama: ambil semua kata yang punya huruf tengah di dalamnya
  wordList.forEach((word) => {
    if (word.includes(centerLetter)) wordsWithCenterLetter.push(word);
  });

  // filter kedua: ambil semua kata yang terdiri dari huruf2 specificLetters saja
  for (let i = 0; i < wordsWithCenterLetter.length; i++) {
    const word = wordsWithCenterLetter[i];
    let isSuitable = false;

    // for loop kedua, untuk mengecek kesamaan huruf pada kata dengan semua specificLetters
    for (let j = 0; j < word.length; j++) {
      const letterInWord = word[j];

      // huruf sekarang dibandingkan dengan semua huruf pada specificLetters
      // kalo sama maka langsung keluar dari for loop ketiga ini
      let areLettersSame = true;
      for (let k = 0; k < specificLetters.length; k++) {
        // skip pengecekan kalo huruf sekarang = centerLetter
        if (letterInWord === centerLetter) {
          continue;
        }
        areLettersSame = false;
        const specificLetter = specificLetters[k];
        if (letterInWord === specificLetter) {
          areLettersSame = true;
          break;
        }
      }

      // kalo huruf sekarang engga ada yang sama dengan specificLetters, artinya kata sekarang tidak sesuai kriteria
      // langsung keluar dari for loop kedua ini dan cek kata selanjutnya
      // console.log("areLettersSame:", areLettersSame);
      if (!areLettersSame) {
        isSuitable = false;
        break;
      }

      // kalo sampai sini berarti huruf sekarang ada dalam specificLetters, artinya sekarang masih sesuai kriteria
      isSuitable = true;
    }

    // kalau semua huruf sesuai kriteria maka kata sekarang sesuai dengan jawaban.
    // masukkan kata sekarang ke dalam list kata jawaban (finalWordList)
    if (isSuitable) finalWordList.push(word);
  }

  // cek pangram nya
  finalWordList.forEach((word) => {
    let isPangram = true;
    for (let i = 0; i < specificLetters.length; i++) {
      let huruf = specificLetters[i];
      if (huruf === centerLetter) continue;
      if (!word.includes(huruf)) {
        isPangram = false;
        break;
      }
    }
    if (isPangram) pangrams.push(word);
  });
  // urutkan kata dari yang terpanjang
  finalWordList.sort((a, b) => b.length - a.length);
  console.log(finalWordList);
  console.log(pangrams);

  document.getElementById("pangrams-title").textContent = "Pangrams:";
  pangrams.forEach((pangram) => {
    const pangramElement = document.createElement("div");
    pangramElement.innerHTML = pangram;

    document.getElementById("pangrams").appendChild(pangramElement);
  });

  document.getElementById("answers-title").textContent = "All Words:";
  finalWordList.forEach((word) => {
    const wordElement = document.createElement("div");
    wordElement.innerHTML = word;
    document.getElementById("answers").appendChild(wordElement);
  });
};

const SolveSpellingBee = async () => {
  const { specificLetters = false, centerLetter = false } = GetLetters();
  // kalo specificLetters = false berarti ada hexagon yang belum terisi. artinya jangan solve dulu
  if (!specificLetters) return;

  // kalau sampai sini berarti hexagon sudah lengkap. ambil seluruh kata
  const response = await fetch(
    "https://hasanicahyadi.github.io/spelling-bee-solver/english-words.txt"
  );
  const data = await response.json();
  // selesaikan.
  SpellingBeeSolver(data, centerLetter, specificLetters);
};

/* ************************** SOLVER FUNCTIONS END ************************** */

/* ************************** OTHERS ************************** */
// buat semua input hexagon punya even listener keydown
for (let i = 1; i <= inputs.length; i++) {
  inputs[ke(i)].addEventListener("keydown", HandleKeyDown);
  inputs[ke(i)].addEventListener("keyup", HandleKeyUp);
}

solveButton.addEventListener("click", SolveSpellingBee);
resetButton.addEventListener("click", resetPage);

window.onload = loadFunction();
