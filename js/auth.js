// Carregar o Cognito SDK no seu HTML, antes deste script:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/amazon-cognito-identity-js/5.2.7/amazon-cognito-identity.min.js"></script>

const poolData = {
    UserPoolId: 'us-east-1_RwtbfPRiL',     // 🔹 Substitua pelo seu User Pool ID real
    ClientId: '771f1rlvfsflq5nqhv84dbodt4'     // 🔹 Substitua pelo seu App Client ID real
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function checkAuth() {
    const token = localStorage.getItem("accessToken");
    const currentPage = window.location.pathname;

    if (!token && !currentPage.includes("index.html") && currentPage !== "/") {
        window.location.href = "index.html";
        return false;
    }

    if (token && (currentPage.includes("index.html") || currentPage === "/")) {
        window.location.href = "dashboard.html";
        return false;
    }

    return true;
}

function login(email, password) {
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const userData = {
    Username: email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      console.log('Login bem-sucedido!');
      const accessToken = result.getAccessToken().getJwtToken();
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userEmail", email);
      window.location.href = "dashboard.html";
    },

    onFailure: function (err) {
      alert(err.message || JSON.stringify(err));
    },

    newPasswordRequired: function (userAttributes, requiredAttributes) {
    // Remover atributos que não podem ser alterados
    delete userAttributes.email_verified;
    delete userAttributes.email;  // <- Remova também o email!

    // Pedir nova senha
    const newPassword = prompt("Você precisa definir uma nova senha:");

    // Completa o desafio com a nova senha
    cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
  }
  });
}

function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            login(email, password);
        });
    }
});
