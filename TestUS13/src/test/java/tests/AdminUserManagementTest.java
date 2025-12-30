package tests;

import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.AdminDashboardPage;
import pages.AdminUsersPage;
import pages.LoginPage;
import pages.UserCreatePage;

import java.util.UUID;

public class AdminUserManagementTest extends BaseTest {

    private final String ADMIN_USER = "admin";
    private final String ADMIN_PASS = "123456";

    private String createdUsername;

    // =========================================
    // TC01 – Tạo user PATIENT
    // =========================================
    @Test(priority = 1)
    public void TC01_createUser_success() {
        LoginPage login = new LoginPage(driver, wait);
        login.open(BASE_URL);
        login.login(ADMIN_USER, ADMIN_PASS);

        AdminDashboardPage dashboard = new AdminDashboardPage(driver, wait);
        dashboard.waitForLoaded();

        createdUsername = "vanhai21_" + UUID.randomUUID().toString().substring(0, 5);
        String email = createdUsername + "@gmail.com";

        UserCreatePage create = new UserCreatePage(driver, wait);
        create.open(BASE_URL);
        create.createUser(
                createdUsername,
                email,
                "123123221",
                "vanhai11082",
                "Bệnh nhân"
        );

        Assert.assertTrue(
                create.getSuccessMessage().contains("Tạo tài khoản thành công"),
                "❌ Không tạo được tài khoản"
        );
    }

    // =========================================
    // TC02 – Đổi vai trò PATIENT → DOCTOR
    // =========================================
    @Test(priority = 2)
    public void TC02_changeRole_toDoctor() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.changeRole(createdUsername, "Bác sĩ");

        Assert.assertTrue(
                users.getSuccessMessage().contains("Cập nhật phân quyền"),
                "❌ Không đổi được role sang Bác sĩ"
        );
    }

    // =========================================
    // TC03 – Khóa & Mở khóa user
    // =========================================
    @Test(priority = 3)
    public void TC03_lock_unlock_user() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);

        users.toggleLock(createdUsername);
        Assert.assertTrue(users.getSuccessMessage().contains("Đã khóa"));

        users.toggleLock(createdUsername);
        Assert.assertTrue(users.getSuccessMessage().contains("Đã mở khóa"));
    }

    // =========================================
    // TC04 – Trùng username
    // =========================================
    @Test(priority = 4)
    public void TC04_createUser_duplicateUsername() {
        UserCreatePage create = new UserCreatePage(driver, wait);
        create.open(BASE_URL);

        create.createUser(
                createdUsername,
                "dup_" + createdUsername + "@gmail.com",
                "0999999999",
                "123456",
                "Bệnh nhân"
        );

        Assert.assertTrue(
                create.getErrorMessage().contains("Tài khoản đã tồn tại"),
                "❌ Không báo lỗi trùng username"
        );
    }

    // =========================================
    // TC05 – Trùng email
    // =========================================
    @Test(priority = 5)
    public void TC05_createUser_duplicateEmail() {
        UserCreatePage create = new UserCreatePage(driver, wait);
        create.open(BASE_URL);

        create.createUser(
                "new_" + UUID.randomUUID().toString().substring(0, 4),
                createdUsername + "@gmail.com",
                "0888888888",
                "123456",
                "Bệnh nhân"
        );

        Assert.assertTrue(
                create.getErrorMessage().contains("Tài khoản đã tồn tại"),
                "❌ Không báo lỗi trùng email"
        );
    }

    // =========================================
    // TC06 – Đổi role → ADMIN (FIX TEXT)
    // =========================================
    @Test(priority = 6)
    public void TC06_changeRole_toAdmin() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.changeRole(createdUsername, "Admin"); // ✅ ĐÚNG UI

        Assert.assertTrue(
                users.getSuccessMessage().contains("Cập nhật phân quyền"),
                "❌ Không đổi được role sang Admin"
        );
    }

    // =========================================
    // TC08 – Filter theo Bác sĩ
    // =========================================
    @Test(priority = 8)
    public void TC08_filterByDoctorRole() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.filterByRole("Bác sĩ");

        Assert.assertTrue(
                users.allRowsHaveRole("Bác sĩ"),
                "❌ Danh sách có user không phải Bác sĩ"
        );
    }


    // =========================================
    // TC09 – Filter theo Bệnh nhân
    // =========================================
    @Test(priority = 9)
    public void TC09_filterByPatientRole() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.filterByRole("Bệnh nhân");

        Assert.assertTrue(
                users.allRowsHaveRole("Bệnh nhân"),
                "❌ Danh sách có user không phải Bệnh nhân"
        );
    }


    // =========================================
    // TC10 – Filter LOCKED
    // =========================================
    @Test(priority = 10)
    public void TC10_filterLockedUsers() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.filterByStatus("LOCKED");

        Assert.assertTrue(
                users.allRowsHaveStatus("LOCKED"),
                "❌ Danh sách có user không bị LOCKED"
        );
    }

    // =========================================
    // TC11 – Reset filter
    // =========================================
    @Test(priority = 11)
    public void TC11_resetFilters() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);

        users.filterByRole("Bác sĩ");
        users.filterByStatus("LOCKED");

        users.clickReset();

        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(
                By.xpath("//tbody/tr"), 0
        ));

        Assert.assertTrue(
                driver.findElements(By.xpath("//tbody/tr")).size() > 0,
                "❌ Reset không reload danh sách"
        );
    }

    // =========================================
    // TC12 – Refresh
    // =========================================
    @Test(priority = 12)
    public void TC12_refreshUserList() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);

        users.clickRefresh();

        wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(
                By.xpath("//tbody/tr"), 0
        ));

        Assert.assertTrue(
                driver.findElements(By.xpath("//tbody/tr")).size() > 0,
                "❌ Refresh không load lại danh sách"
        );
    }
    // =========================================
// TC13 – Xem danh sách Admin
// =========================================
    @Test(priority = 13)
    public void TC13_filterByAdminRole() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.filterByRole("Quản trị viên");   // dropdown filter
        Assert.assertTrue(
                users.allRowsHaveRole("Admin"), // text trong bảng
                "❌ Danh sách có user không phải Admin"
        );

    }

    // =========================================
// TC14 – Search theo username (tìm thấy)
// =========================================
    @Test(priority = 14)
    public void TC14_searchUser_found() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.searchByKeyword(createdUsername);

        Assert.assertTrue(
                users.hasAnyRow(),
                "❌ Không tìm thấy user theo username"
        );

        Assert.assertTrue(
                users.allRowsContainKeyword(createdUsername),
                "❌ Kết quả search không đúng username"
        );
    }
    // =========================================
// TC15 – Search username không tồn tại
// =========================================
    @Test(priority = 15)
    public void TC15_searchUser_notFound() {
        AdminUsersPage users = new AdminUsersPage(driver, wait);
        driver.get(BASE_URL + "/admin/users");

        users.searchByKeyword("user_khong_ton_tai_999");

        Assert.assertTrue(
                users.isNoUserFoundMessageDisplayed(),
                "❌ Không hiển thị thông báo 'Không có người dùng phù hợp'"
        );
    }

}

