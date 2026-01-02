package CongThonTinBenhNhan;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

import Initialization.Init;



public class KiemThuUS142Them extends Init {

	public static void main(String[] args) throws InterruptedException {
		System.out.println("=== BẮT ĐẦU CHẠY TEST ===");

		SetUp("edge");
		driver.get("http://localhost:3000/login");

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']")).click();

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']"))
				.sendKeys("hiepcc@gmail.com");

		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).click();
		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).sendKeys("12345678");
		Thread.sleep(2000);
		driver.findElement(By.xpath("//button[contains(text(),'Đăng nhập')]")).click();
		Thread.sleep(2000);

		driver.findElement(By.xpath("//*[@id=\\\"root\\\"]/div/div/div[1]/a[2]/div")).click();
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//button[contains(text(),'+ Thêm bác sĩ')]")).click();
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[1]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[1]/input")).sendKeys("LM10");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[2]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[2]/input")).sendKeys("lm10@gmail.com");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[3]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[3]/input")).sendKeys("12345678");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[4]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[4]/input")).sendKeys("Messi");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[5]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[5]/input")).sendKeys("Thể thao học đường");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[6]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[6]/input")).sendKeys("Thể thao");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[7]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[7]/input")).sendKeys("C1");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[8]/div/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[8]/div/input")).sendKeys("T2; T4; T5; T6");
		
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[2]/button[2]")).click();
		
		Thread.sleep(2000);
		
	
		 System.out.println("TEST PASS: Thêm bác sĩ mới thành công");
		
		
	}

}
