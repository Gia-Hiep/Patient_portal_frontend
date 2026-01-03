package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class AdminDashboardPage {

    private WebDriver driver;

    private By btnGoToBackup =
            By.xpath("//a[normalize-space()='Backup dữ liệu ngay']");

    public AdminDashboardPage(WebDriver driver) {
        this.driver = driver;
    }

    public void goToBackupPage() {
        driver.findElement(btnGoToBackup).click();
    }

    public By getBtnGoToBackup() {
        return btnGoToBackup;
    }
}
