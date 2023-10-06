/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { api } from "../utils/api";
import { auth } from "../utils/auth";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";
import ImagePopup from "./ImagePopup";
import Main from "./Main";
import PopupWithForm from "./PopupWithForm";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import Login from "./Login";
import Register from "./Register";
import ProtectedRouteElement from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";

function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [infoToolTipStatus, setInfoToolTipStatus] = useState(false);
  const [isOk, setIsOk] = useState(false);

  const navigate = useNavigate();

  const isOpen = isEditProfilePopupOpen || isAddPlacePopupOpen || isEditAvatarPopupOpen || selectedCard;

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      auth
        .checkToken(jwt)
        .then((res) => {
          if (res) {
            setLoggedIn(true);
            navigate("/");
            setEmail(res.data.email);
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

  const handleLogin = (values) => {
    if (!values.email || !values.password) {
      return;
    }
    auth
      .authorize(values.email, values.password)
      .then((data) => {
        if (data.token) {
          setLoggedIn(true);
          localStorage.setItem("jwt", data.token);
          setEmail(values.email);
          navigate("/");
        }
      })
      .catch((err) => {
        setInfoToolTipStatus(true);
        setIsOk(false);
        setIsInfoTooltipOpen((prev) => !prev);
        console.log(err);
      });
  };

  const handleRegister = (values) => {
    if (!values.email || !values.password) {
      return;
    }
    auth
      .register(values.email, values.password)
      .then((res) => {
        setIsOk(true);
        setInfoToolTipStatus(false);
        setIsInfoTooltipOpen((prev) => !prev);
        navigate("/sign-in", { replace: true });
      })
      .catch((err) => {
        setInfoToolTipStatus(true);
        setIsOk(false);
        setIsInfoTooltipOpen((prev) => !prev);
        console.log(err);
      });
  }

  const handleSignOut = () => {
    setEmail("");
    localStorage.removeItem("jwt");
  };

  useEffect(() => {
    if (loggedIn) {
      api.getUserInfo().then((user) => {
        setCurrentUser(user);
      })
        .catch((err) => {
          console.log(`Ошибка: ${err}`);
        });
      api.getInitialCards().then(dataCard => {
        setCards(dataCard);
      })
        .catch((err) => {
          console.log(`Ошибка: ${err}`);
        });
    }
  }, [loggedIn]);

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
      setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      });
  }

  function handleCardDelete(card) {
    api.removeCard(card._id).then(() => {
      setCards((state) => state.filter((item) => item._id !== card._id));
    })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      });
  }

  const handleEditProfileClick = () => {
    setEditProfilePopupOpen(true);
  };

  const handleAddPlaceClick = () => {
    setAddPlacePopupOpen(true);
  };

  const handleEditAvatarClick = () => {
    setEditAvatarPopupOpen(true);
  };

  const handleCardClick = (data) => {
    setSelectedCard(data);
  }

  const closeAllPopups = () => {
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setSelectedCard(null);
    setIsInfoTooltipOpen(false);
  };

  const handleUpdateUser = (user) => {
    setIsLoading(true);
    api.updateUser(user)
      .then((updatedUser) => {
        setCurrentUser(updatedUser);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleUpdateAvatar = (avatar) => {
    api
      .updateAvatar(avatar)
      .then((user) => {
        setCurrentUser(user);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  function handleAddPlaceSubmit(data) {
    setIsLoading(true);
    api
      .addNewCard(data)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка: ${err}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    function handleCloseByEsc(e) {
      if (e.key === 'Escape') {
        closeAllPopups();
      }
    }
    function handleClickOnOverlay(e) {
      if (e.target.classList.contains('popup_opened')) {
        closeAllPopups();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleCloseByEsc);
      document.addEventListener('mousedown', handleClickOnOverlay);
    }
    return () => {
      document.removeEventListener('keydown', handleCloseByEsc);
      document.removeEventListener('mousedown', handleClickOnOverlay);
    };
  }, [isOpen]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header email={email} onSignOut={handleSignOut} />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRouteElement
                element={Main}
                loggedIn={loggedIn}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onEditAvatar={handleEditAvatarClick}
                onCardClick={handleCardClick}
                onCardLike={handleCardLike}
                onCardDelete={handleCardDelete}
                cards={cards}
              />
            }
          />
          <Route
            path="/sign-up"
            element={<Register
              onRegister={handleRegister}
              setInfoToolTipStatus={setInfoToolTipStatus}
              setIsInfoTooltipOpen={setIsInfoTooltipOpen}
              setIsOk={setIsOk}
            />}
          />
          <Route
            path="/sign-in"
            element={
              <Login
                onLogin={handleLogin}
                setInfoToolTipStatus={setInfoToolTipStatus}
                setIsInfoTooltipOpen={setIsInfoTooltipOpen}
                setEmail={setEmail}
                setIsOk={setIsOk}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} isLoading={isLoading} />
        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} isLoading={isLoading} />
        <PopupWithForm
          title="Вы уверены?"
          name="remove-card"
          buttonText="Да"
        />
        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} isLoading={isLoading} />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      </div>
      <InfoTooltip
        isOpen={isInfoTooltipOpen}
        onClose={closeAllPopups}
        infoToolTipStatus={infoToolTipStatus}
        isOk={isOk}
        successText="Вы успешно зарегистрировались!"
        errorText="Что-то пошло не так! Попробуйте ещё раз."
      />
    </CurrentUserContext.Provider>
  );
}

export default App;
