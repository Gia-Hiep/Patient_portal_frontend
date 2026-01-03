package tests;

import base.BaseTest;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import pages.AdminDashboardPage;
import pages.BackupPage;
import pages.LoginPage;

import java.time.Duration;

public class BackupTest extends BaseTest {

    private BackupPage backupPage;
    private WebDriverWait wait;

    // ===============================
    // LOGIN + VÀO TRANG BACKUP 1 LẦN
    // ===============================
    @BeforeClass
    public void setupBackupPage() {

        wait = new WebDriverWait(driver, Duration.ofSeconds(25));

        // ===== LOGIN 1 LẦN =====
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("admin", "123456");

        wait.until(ExpectedConditions.urlContains("/dashboard"));

        // ===== VÀO TRANG BACKUP =====
        AdminDashboardPage dashboard = new AdminDashboardPage(driver);
        wait.until(ExpectedConditions.elementToBeClickable(
                dashboard.getBtnGoToBackup()
        ));
        dashboard.goToBackupPage();

        backupPage = new BackupPage(driver);

        // Đợi bảng lịch sử load
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                backupPage.getHistoryRows()
        ));
    }

    // ===============================
    // TC01 – BACKUP THÀNH CÔNG
    // ===============================
    @Test(priority = 1)
    public void TC01_AdminBackupSuccess() {

        int beforeCount = backupPage.getHistoryCount();

        wait.until(ExpectedConditions.elementToBeClickable(
                backupPage.getBtnBackupNow()
        ));
        backupPage.clickBackupNow();

        // Đợi lịch sử tăng
        wait.until(d ->
                backupPage.getHistoryCount() > beforeCount
        );

        Assert.assertTrue(
                backupPage.isLatestBackupSuccess(),
                "❌ Backup không thành công (không thấy SUCCESS)"
        );
    }

    // ===============================
    // TC02 – IN LỊCH SỬ BACKUP
    // ===============================
    @Test(priority = 2)
    public void TC02_PrintBackupHistory() {

        backupPage.printBackupHistoryToConsole();

        Assert.assertTrue(
                backupPage.getHistoryCount() > 0,
                "❌ Không có lịch sử backup"
        );
    }

    // ===============================
    // TC03 – LÀM MỚI TRANG
    // ===============================
    @Test(priority = 3)
    public void TC03_RefreshBackupPage() {

        int beforeRefresh = backupPage.getHistoryCount();

        wait.until(ExpectedConditions.elementToBeClickable(
                backupPage.getBtnRefresh()
        ));
        backupPage.clickRefresh();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                backupPage.getHistoryRows()
        ));

        int afterRefresh = backupPage.getHistoryCount();

        Assert.assertTrue(
                afterRefresh > 0,
                "❌ Sau khi làm mới, lịch sử bị trống"
        );

        Assert.assertTrue(
                afterRefresh >= beforeRefresh,
                "❌ Sau khi làm mới, lịch sử giảm bất thường"
        );
    }

    @Test
    public void TC05_Admin_BackupMultipleTimes() {



        int beforeCount = backupPage.getHistoryCount();

        // ===== BACKUP LẦN 1 =====
        backupPage.clickBackupNow();
        wait.until(d -> backupPage.getHistoryCount() == beforeCount + 1);

        // ===== BACKUP LẦN 2 =====
        backupPage.clickBackupNow();
        wait.until(d -> backupPage.getHistoryCount() == beforeCount + 2);

        // ===== VERIFY =====
        Assert.assertTrue(
                backupPage.isLatestBackupSuccess(),
                "❌ Backup lần cuối không SUCCESS"
        );

        // In lịch sử
        backupPage.printBackupHistoryToConsole();
    }

}
