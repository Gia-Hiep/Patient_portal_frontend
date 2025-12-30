package pages;



import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;

public class AdminDashboardPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    public AdminDashboardPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void waitForLoaded() {
        wait.until(ExpectedConditions.urlContains("/dashboard"));
    }

    public void goToUserManagement() {
        driver.findElement(By.xpath("//a[@href='/admin/users']")).click();
    }

}
