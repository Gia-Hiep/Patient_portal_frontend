package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage {

    private WebDriver driver;

    // ===== LOCATORS (ĐÚNG JSX) =====
    private By usernameInput = By.xpath(
            "//input[@placeholder='vd: patient01@hospital.local']"
    );

    private By passwordInput = By.xpath(
            "//input[@type='password']"
    );

    private By loginButton = By.xpath(
            "//button[normalize-space()='Đăng nhập']"
    );

    private By errorMessage = By.xpath(
            "//div[contains(@class,'alert')]"
    );

    // ===== CONSTRUCTOR =====
    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    // ===== ACTIONS =====
    public void login(String username, String password) {
        driver.findElement(usernameInput).clear();
        driver.findElement(usernameInput).sendKeys(username);

        driver.findElement(passwordInput).clear();
        driver.findElement(passwordInput).sendKeys(password);

        driver.findElement(loginButton).click();
    }

    // ===== VERIFICATIONS =====
    public boolean isLoginErrorDisplayed() {
        return driver.findElements(errorMessage).size() > 0;
    }
}
