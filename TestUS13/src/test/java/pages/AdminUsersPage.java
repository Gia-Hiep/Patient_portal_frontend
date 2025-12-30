package pages;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;

import java.time.Duration;
import java.util.List;

public class AdminUsersPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    public AdminUsersPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    // =========================================================
    // LOCATORS
    // =========================================================
    private final By noDataMessage =
            By.xpath("//*[contains(text(),'Không có người dùng')]");

    private final By successAlert = By.cssSelector(".alert.success");
    private final By tableRows = By.cssSelector("tbody tr");
    // Đếm số dòng user trong bảng
    public int getRowCount() {
        return driver.findElements(By.cssSelector("tbody tr")).size();
    }

    // Filter dropdowns (UI TEXT)
    // Vai trò: Tất cả vai trò | Bệnh nhân | Bác sĩ | Quản trị viên
    private final By roleFilterSelect =
            By.xpath("//select[option[normalize-space(.)='Tất cả vai trò']]");

    // Trạng thái: Tất cả trạng thái | ACTIVE | LOCKED | DISABLED
    private final By statusFilterSelect =
            By.xpath("//select[option[normalize-space(.)='Tất cả trạng thái']]");

    private final By resetBtn = By.xpath("//button[normalize-space(.)='Reset']");
    private final By refreshBtn = By.xpath("//button[normalize-space(.)='Refresh']");

    private final By searchInput =
            By.xpath("//input[contains(@placeholder,'username')]");

    // =========================================================
    // WAIT HELPERS (CHUẨN REACT)
    // =========================================================

    private void waitTableRendered() {
        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(tableRows, 0));
    }

    private void waitTableUpdatedAfterAction() {
        List<WebElement> before = driver.findElements(tableRows);

        if (!before.isEmpty()) {
            try {
                wait.until(ExpectedConditions.stalenessOf(before.get(0)));
            } catch (TimeoutException ignore) {
                // React có thể chỉ update text → không stale
            }
        }

        waitTableRendered();

        // buffer nhỏ để UI ổn định
        new WebDriverWait(driver, Duration.ofSeconds(2))
                .until(d -> true);
    }

    // =========================================================
    // ACTIONS
    // =========================================================

    // Đổi vai trò user (select trong bảng + confirm)
    public void changeRole(String username, String roleText) {
        By roleSelect =
                By.xpath("//tr[td[normalize-space(.)='" + username + "']]//td[4]//select");

        new Select(wait.until(ExpectedConditions.elementToBeClickable(roleSelect)))
                .selectByVisibleText(roleText);

        Alert alert = wait.until(ExpectedConditions.alertIsPresent());
        alert.accept();

        wait.until(ExpectedConditions.visibilityOfElementLocated(successAlert));
    }

    // Khóa / Mở khóa user
    public void toggleLock(String username) {
        By lockBtn =
                By.xpath("//tr[td[normalize-space(.)='" + username + "']]//td[last()]//button");

        wait.until(ExpectedConditions.elementToBeClickable(lockBtn)).click();

        Alert alert = wait.until(ExpectedConditions.alertIsPresent());
        alert.accept();

        wait.until(ExpectedConditions.visibilityOfElementLocated(successAlert));
    }

    public String getSuccessMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successAlert))
                .getText();
    }

    // =========================================================
    // FILTER
    // =========================================================

    public void filterByRole(String roleText) {
        waitTableRendered();

        new Select(wait.until(ExpectedConditions.elementToBeClickable(roleFilterSelect)))
                .selectByVisibleText(roleText);

        waitTableUpdatedAfterAction();
    }

    public void filterByStatus(String statusText) {
        waitTableRendered();

        new Select(wait.until(ExpectedConditions.elementToBeClickable(statusFilterSelect)))
                .selectByVisibleText(statusText);

        waitTableUpdatedAfterAction();
    }

    public void filterByAdminRole() {
        filterByRole("Quản trị viên"); // ✅ UI TEXT
    }

    public void clickReset() {
        wait.until(ExpectedConditions.elementToBeClickable(resetBtn)).click();
        waitTableUpdatedAfterAction();
    }

    public void clickRefresh() {
        wait.until(ExpectedConditions.elementToBeClickable(refreshBtn)).click();
        waitTableUpdatedAfterAction();
    }

    // =========================================================
    // SEARCH
    // =========================================================

    public void searchByKeyword(String keyword) {
        WebElement input = wait.until(ExpectedConditions.elementToBeClickable(searchInput));
        input.clear();
        input.sendKeys(keyword);

        // chỉ chờ UI ổn định, KHÔNG đợi row > 0
        new WebDriverWait(driver, Duration.ofSeconds(3))
                .until(d -> true);
    }
    public boolean isNoUserFoundMessageDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(noDataMessage))
                .isDisplayed();
    }


    // =========================================================
    // ASSERTIONS (CHECK DATA)
    // =========================================================

    /**
     * CHECK ROLE ĐÚNG:
     * - Role nằm trong <select> của cột Vai trò
     * - Lấy option đang selected
     */
    public boolean allRowsHaveRole(String expectedRoleText) {
        waitTableRendered();

        List<WebElement> rows = driver.findElements(tableRows);
        for (WebElement row : rows) {
            WebElement roleSelect = row.findElement(By.xpath("./td[4]//select"));
            Select s = new Select(roleSelect);
            String selected = s.getFirstSelectedOption().getText().trim();

            if (!selected.equalsIgnoreCase(expectedRoleText.trim())) {
                System.out.println("❌ Role mismatch: found='" + selected +
                        "', expected='" + expectedRoleText + "'");
                return false;
            }
        }
        return true;
    }

    public boolean allRowsHaveAdminRole() {
        return allRowsHaveRole("Quản trị viên");
    }

    /**
     * CHECK STATUS:
     * - ACTIVE / LOCKED / DISABLED
     */
    public boolean allRowsHaveStatus(String expectedStatus) {
        waitTableRendered();

        List<WebElement> rows = driver.findElements(tableRows);
        for (WebElement row : rows) {
            String statusText =
                    row.findElement(By.xpath("./td[5]//span")).getText().trim();

            if (!statusText.equalsIgnoreCase(expectedStatus.trim())) {
                System.out.println("❌ Status mismatch: found='" + statusText +
                        "', expected='" + expectedStatus + "'");
                return false;
            }
        }
        return true;
    }

    public boolean hasAnyRow() {
        return driver.findElements(tableRows).size() > 0;
    }

    public boolean allRowsContainKeyword(String keyword) {
        keyword = keyword.toLowerCase();

        for (WebElement row : driver.findElements(tableRows)){
            if (!row.getText().toLowerCase().contains(keyword)) {
                return false;
            }
        }
        return true;
    }
}
