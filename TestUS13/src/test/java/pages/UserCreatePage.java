package pages;





import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;

public class UserCreatePage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    public UserCreatePage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    // locator đúng JSX
    private By username =
            By.xpath("//input[@placeholder='vd: hiepcc22']");
    private By email =
            By.xpath("//input[@type='email']");
    private By phone =
            By.xpath("//input[@placeholder='vd: 09xxxxxxxx']");
    private By password =
            By.xpath("//input[@type='password']");
    private By role =
            By.xpath("//select");
    private By submit =
            By.xpath("//button[@type='submit']");
    private By successAlert =
            By.cssSelector(".alert.success");
    private By errorAlert =
            By.cssSelector(".alert.error");

    public void open(String baseUrl) {
        driver.get(baseUrl + "/admin/users/create");
    }

    public void createUser(String u, String e, String p, String pw, String roleText) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(username)).sendKeys(u);
        driver.findElement(email).sendKeys(e);
        if (p != null) driver.findElement(phone).sendKeys(p);
        driver.findElement(password).sendKeys(pw);

        new Select(driver.findElement(role))
                .selectByVisibleText(roleText);

        driver.findElement(submit).click();
    }

    public String getSuccessMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successAlert))
                .getText();
    }

    public String getErrorMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(errorAlert))
                .getText();
    }
}

