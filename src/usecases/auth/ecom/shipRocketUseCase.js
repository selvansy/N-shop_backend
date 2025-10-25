import { shipRocketApi } from "../../../config/chit/shipRocketService.js";

class ShipRocketUseCase {
  constructor() {
    this.token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjc2MTcxOTQsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzU4MjQyMzA1LCJqdGkiOiJtSWhCaFh4RGlqZERIVDltIiwiaWF0IjoxNzU3Mzc4MzA1LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTc1NzM3ODMwNSwiY2lkIjo3Mzc5NDY3LCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6IiJ9.3W6CSCJWdeOqhcpYGZqp5q6QaN1XfFfAN0k9ju6Qf6Y"
  }

  async generateToken(userData) {
    try {
      const { email, password } = userData;
      
    //   const token = await shipRocketApi("post", "auth/login", { email, password });
    //   this.token=token
    const token = this.token
      return token;
    } catch (error) {
      console.error("Generate Token Error:", error);
      throw new Error("Failed to generate token for ShipRocket");
    }
  }

  async generateOrder(){
    try{
        return true
    }catch(error){
     console.error("Create Order Error:", error);
      throw new Error("Failed to Create Order In ShipRocket");   
    }
  }
}

export default ShipRocketUseCase;
