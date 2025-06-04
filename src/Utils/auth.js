export function isLoggedIn() {
    return !!localStorage.getItem("adminToken");
  }
  
  export function login(token) {
    localStorage.setItem("adminToken", token);
  }
  
  export function logout() {
    localStorage.removeItem("adminToken");
  }