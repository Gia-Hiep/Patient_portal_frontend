package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class BackupPage {

    private WebDriver driver;

    // ===============================
    // BUTTONS
    // ===============================

    // Nút Backup dữ liệu ngay
    private By btnBackupNow =
            By.xpath("//button[contains(@class,'chip-btn') and normalize-space()='Backup dữ liệu ngay']");

    // Nút Làm mới
    private By btnRefresh =
            By.xpath("//button[contains(@class,'chip-btn') and normalize-space()='Làm mới']");

    // ===============================
    // PERMISSION / ERROR
    // ===============================

    // Thông báo không có quyền
    private By noPermissionMsg =
            By.xpath("//div[contains(@class,'alert') and contains(@class,'error') and contains(text(),'không có quyền')]");

    // ===============================
    // HISTORY TABLE
    // ===============================

    private By historyRows =
            By.xpath("//table[.//th[normalize-space()='Thời gian']]//tbody/tr");

    // Badge SUCCESS ở dòng mới nhất
    private By latestSuccessBadge =
            By.xpath("(//table[.//th[normalize-space()='Thời gian']]//tbody/tr)[1]//span[normalize-space()='SUCCESS']");

    // Cell trong từng row
    private By cellTime   = By.xpath("./td[1]");
    private By cellStatus = By.xpath("./td[2]");
    private By cellFile   = By.xpath("./td[3]");

    // ===============================
    // CONSTRUCTOR
    // ===============================
    public BackupPage(WebDriver driver) {
        this.driver = driver;
    }

    // ===============================
    // ACTIONS
    // ===============================
    public void clickBackupNow() {
        driver.findElement(btnBackupNow).click();
    }

    public void clickRefresh() {
        driver.findElement(btnRefresh).click();
    }

    // ===============================
    // DATA
    // ===============================
    public int getHistoryCount() {
        return driver.findElements(historyRows).size();
    }

    public List<WebElement> getHistoryRowsElements() {
        return driver.findElements(historyRows);
    }

    public void printBackupHistoryToConsole() {
        List<WebElement> rows = getHistoryRowsElements();

        System.out.println("===== BACKUP HISTORY =====");
        for (int i = 0; i < rows.size(); i++) {
            String time   = rows.get(i).findElement(cellTime).getText();
            String status = rows.get(i).findElement(cellStatus).getText();
            String file   = rows.get(i).findElement(cellFile).getText();

            System.out.printf(
                    "%d. %s | %s | %s%n",
                    i + 1, time, status, file
            );
        }
        System.out.println("==========================");
    }

    // ===============================
    // VERIFICATIONS
    // ===============================

    // Backup thành công nếu dòng mới nhất có SUCCESS
    public boolean isLatestBackupSuccess() {
        return driver.findElements(latestSuccessBadge).size() > 0;
    }

    // Kiểm tra có nút Backup (dùng cho ADMIN)
    public boolean isBackupButtonDisplayed() {
        return driver.findElements(btnBackupNow).size() > 0;
    }

    // Kiểm tra thông báo không có quyền (DOCTOR / PATIENT)
    public boolean isNoPermissionMessageDisplayed() {
        return driver.findElements(noPermissionMsg).size() > 0;
    }

    // ===============================
    // GETTERS (CHO WEBDRIVERWAIT)
    // ===============================
    public By getBtnBackupNow() {
        return btnBackupNow;
    }

    public By getBtnRefresh() {
        return btnRefresh;
    }

    public By getHistoryRows() {
        return historyRows;
    }

    public By getLatestSuccessBadge() {
        return latestSuccessBadge;
    }

    public By getNoPermissionMsg() {
        return noPermissionMsg;
    }
}
