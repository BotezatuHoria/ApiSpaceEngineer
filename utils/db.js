const { Sequelize, DataTypes } = require("sequelize");

const checks = require("./checks");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db/database.sqlite",
});

async function defineModels() {
  sequelize.define("User", {
    email: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  sequelize.define("Question", {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  sequelize.define("Answer", {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  sequelize.define("Material", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  sequelize.define("UserData", {
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    highScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
}

async function init() {
  await defineModels();
  await sequelize.sync({ force: true });
}

async function getUserByEmail(email) {
  const notNullOrEmptyStringCheck = checks.notNullOrEmptyString(email);
  if (!notNullOrEmptyStringCheck.valid) {
    return {
      users: [],
      error: {
        message: `email invalid due to: ${notNullOrEmptyStringCheck.reason}`,
      },
    };
  }
  const users = await sequelize.models.User.findAll({
    where: { email },
  });

  return {
    users,
  };
}

async function findUserByEmailAndHashedPassword(email, hashedPassword) {
  const emailNotNullOrEmptyStringCheck = checks.notNullOrEmptyString(email);
  if (!emailNotNullOrEmptyStringCheck.valid) {
    return {
      user: null,
      error: {
        message: `email invalid due to: ${emailNotNullOrEmptyStringCheck.reason}`,
      },
    };
  }

  const hashedPasswordNotNullOrEmptyStringCheck =
    checks.notNullOrEmptyString(hashedPassword);
  if (!hashedPasswordNotNullOrEmptyStringCheck.valid) {
    return {
      user: null,
      error: {
        message: `hashed password invalid due to: ${hashedPasswordNotNullOrEmptyStringCheck.reason}`,
      },
    };
  }

  const user = await sequelize.models.User.findOne({
    where: {
      email,
      hashedPassword,
    },
  });

  return {
    user,
  };
}

async function getQuestionsWithAnswers() {
  const questions = await sequelize.models.Question.findAll();
  const answers = await sequelize.models.Answer.findAll();

  const map = new Map();
  questions.forEach((question) => {
    map.set(question.id, []);
  });

  answers.forEach((answer) => {
    map.get(answer.questionId).push(answer);
  });

  return questions.map((question) => ({
    question,
    answers: map.get(question.id),
  }));
}

async function getUserData(userId) {
  const trackerData = await sequelize.models.UserData.findAll({
    where: {
      userId,
    },
  });

  return {
    data: trackerData,
  };
}

async function createUser(email, firstName, lastName, hashedPassword) {
  try {
    const newUser = await sequelize.models.User.create({
      email,
      firstName,
      lastName,
      hashedPassword,
    });
    await newUser.save();
    return {
      user: newUser,
    };
  } catch (e) {
    return {
      user: null,
      error: {
        message: e.message,
      },
    };
  }
}

async function createQuestionWithAnswers(prompt, answers) {
  let newQuestion = null;
  try {
    newQuestion = await sequelize.models.Question.create({
      prompt,
    });

    await newQuestion.save();
  } catch (e) {
    return {
      error: {
        message: `Encountered ${e.message} when trying to create the question`,
      },
    };
  }

  let answerErrors = [];
  let newAnswers = [];
  for (let i = 0; i < answers.length; ++i) {
    const { prompt, isCorrect } = answers[i];

    try {
      const newAnswer = await sequelize.models.Answer.create({
        questionId: newQuestion.id,
        prompt,
        isCorrect,
      });

      await newAnswer.save();

      newAnswers.push(newAnswer);
    } catch (e) {
      answerErrors.push({
        message: `Encountered an error with answer #${index}: ${e.message}`,
      });
    }
  }

  return {
    question: newQuestion,
    answers: newAnswers,
    answerErrors,
  };
}

async function addUserData(userId, timeSpent, highScore) {
  try {
    const newData = await sequelize.models.UserData.create({
      userId,
      timeSpent,
      highScore,
    });

    await newData.save();

    return {
      status: "success",
      data: newData,
    };
  } catch (e) {
    return {
      status: "error",
      error: {
        message: `Encountered error when trying to save tracker data: ${e.message}`,
      },
    };
  }
}

module.exports = {
  init,
  getUserByEmail,
  findUserByEmailAndHashedPassword,
  getQuestionsWithAnswers,
  getUserData,
  createUser,
  createQuestionWithAnswers,
  addUserData,
};
