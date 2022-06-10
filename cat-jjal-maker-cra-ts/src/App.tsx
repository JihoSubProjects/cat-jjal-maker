import React, { ChangeEvent, FormEvent } from 'react';
import Title from './components/Title';

const jsonLocalStorage = {
  setItem: (key: string, value: string | number | Array<string>) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key: string) => {
    return JSON.parse(localStorage.getItem(key) as string);
  },
};

const fetchCat = async (text: string) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(`${OPEN_API_DOMAIN}/cat/says/${text}?json=true`);
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};

const Form = ({ updateMainCat }: { updateMainCat: (value: string) => void }) => {
  const includesHangul = (text: string) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
  const [value, setValue] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const userValue = e.target.value;
    setErrorMessage("");
    if (includesHangul(userValue)) {
      setErrorMessage("한글은 입력할 수 없습니다.");
    }
    setValue(userValue.toUpperCase());
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (value === "") {
      setErrorMessage("빈 값으로 만들 수 없습니다.");
      return;
    }
    updateMainCat(value);
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="name"
        placeholder="영어 대사를 입력해주세요"
        value={value}
        onChange={handleInputChange}
      />
      <button type="submit">생성</button>
      <p style={{ color: "red" }}>{errorMessage}</p>
    </form>
  );
};

function CatItem({ img }: { img: string }) {
  return (
    <li>
      <img src={img} alt="고양이 짤" style={{ width: "150px" }} />
    </li>
  );
}

function Favorites({ favorites }: { favorites: Array<string> }) {
  if (favorites.length === 0) {
    return <div>사진에서 하트를 눌러 고양이 사진을 저장해봐요!</div>
  }
  return (
    <ul className="favorites">
      {favorites.map((cat) => (
        <CatItem img={cat} key={cat} />
      ))}
    </ul>
  );
}

const MainCard = (
  { img, onHeartClick, isLiked }: { img: string, onHeartClick: () => void, isLiked: boolean }
) => {
  const heartIcon = isLiked ? '💖' : '🤍';
  return (
    <div className="main-card">
      <img src={img} alt="고양이 소환 중...🐈" width="400" />
      <button onClick={onHeartClick}>{heartIcon}</button>
    </div>
  );
};

const App = () => {
  const [counter, setCounter] = React.useState(() => jsonLocalStorage.getItem("counter") || 0);
  const [mainCat, setMainCat] = React.useState("");
  const [favorites, setFavorites] = React.useState(() => jsonLocalStorage.getItem("favorites") || []);
  const isLiked = favorites.includes(mainCat);

  async function setInitialCat() {
    const newCat = await fetchCat('First Cat');
    setMainCat(newCat)
  }

  async function updateMainCat(value: string) {
    setMainCat(await fetchCat(value));
    setCounter((prev: number) => {
      const nextCounter = prev + 1;
      jsonLocalStorage.setItem("counter", nextCounter);
      return nextCounter;
    });
  }

  function handleHeartClick() {
    const nextFavorites = [...favorites, mainCat];
    setFavorites(nextFavorites);
    jsonLocalStorage.setItem("favorites", nextFavorites);
  }

  React.useEffect(() => {
    setInitialCat()
  }, []);

  return (
    <div>
      <Title>{counter ? counter + '번째 ' : ''}고양이 가라사대</Title>
      <Form updateMainCat={updateMainCat} />
      <MainCard img={mainCat} onHeartClick={handleHeartClick} isLiked={isLiked} />
      <Favorites favorites={favorites} />
    </div>
  );
};

export default App;
