export function isLoggedIn() {
    return !!sessionStorage.getItem("adminToken");
  }
  
  export function login(token) {
    sessionStorage.setItem("adminToken", token);
  }
  
  export function logout() {
    sessionStorage.removeItem("adminToken");
  }