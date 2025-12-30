package pages;




import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;

public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    public LoginPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    // locator đúng JSX
    private By usernameInput =
            By.xpath("//input[@autocomplete='username']");
    private By passwordInput =
            By.xpath("//input[@type='password' and @autocomplete='current-password']");
    private By loginButton =
            By.xpath("//button[@type='submit']");

    public void open(String baseUrl) {
        driver.get(baseUrl + "/login");
    }

    public void login(String username, String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(usernameInput))
                .sendKeys(username);

        driver.findElement(passwordInput).sendKeys(password);
        driver.findElement(loginButton).click();
    }
}

