/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
  createCardElement,
  deleteCard,
  toggleLikeButton,
  updateLikeCount,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardFromServer,
  changeLikeCardStatus,
} from "./components/api.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

let currentUserId = null;

let cardToDelete = null;
let cardIdToDelete = null;

const renderLoading = (button, isLoading, defaultText = "Сохранить") => {
  if (isLoading) {
    button.textContent = defaultText === "Создать" ? "Создание..." : "Сохранение...";
  } else {
    button.textContent = defaultText;
  }
};

const renderDeleteLoading = (button, isLoading) => {
  if (isLoading) {
    button.textContent = "Удаление...";
  } else {
    button.textContent = "Да";
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardElement, likeButton, cardId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      toggleLikeButton(likeButton);
      updateLikeCount(cardElement, updatedCard.likes.length);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCardClick = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardIdToDelete = cardId;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = removeCardForm.querySelector(".popup__button");

  renderDeleteLoading(submitButton, true);

  deleteCardFromServer(cardIdToDelete)
    .then(() => {
      deleteCard(cardToDelete);
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderDeleteLoading(submitButton, false);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");

  renderLoading(submitButton, true);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
      clearValidation(profileForm, validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");

  renderLoading(submitButton, true);

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
      clearValidation(avatarForm, validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");

  renderLoading(submitButton, true, "Создать");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
        })
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
      clearValidation(cardForm, validationSettings);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Создать");
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});