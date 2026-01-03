package tests;

import base.BaseTest;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import pages.BackupPage;
import pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class BackupPermissionTest extends BaseTest {

    @Test
    public void TC04_Doctor_CannotBackup() {

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        // ===== LOGIN BẰNG DOCTOR =====
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("doctor", "123456");

        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // ===== TRUY CẬP TRANG BACKUP =====
        driver.get("http://localhost:3000/admin/backup");

        BackupPage backupPage = new BackupPage(driver);

        // ===== VERIFY THÔNG BÁO KHÔNG CÓ QUYỀN =====
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                backupPage.getNoPermissionMsg()
        ));

        Assert.assertTrue(
                backupPage.isNoPermissionMessageDisplayed(),
                "❌ Không hiển thị thông báo 'Bạn không có quyền truy cập chức năng này.'"
        );
    }
}
