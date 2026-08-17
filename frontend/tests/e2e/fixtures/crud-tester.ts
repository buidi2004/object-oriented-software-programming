import { test, expect, Page } from '@playwright/test';
import { authenticatePage } from './auth';

export interface CrudTestConfig {
  moduleName: string;
  url: string;
  apiEndpoint: string;
  add?: {
    openButtonSelector?: string;
    fillForm: (page: Page) => Promise<void>;
    submitSelector: string;
    verifyText?: string;
  };
  edit?: {
    openButtonSelector: (page: Page) => Promise<any>;
    fillForm: (page: Page) => Promise<void>;
    submitSelector: string;
    verifyText?: string;
  };
  delete?: {
    buttonSelector: (page: Page) => Promise<any>;
    confirmSelector?: string;
  };
}

export async function smartFillForm(page: Page) {
  const elements = await page.locator('input:visible, textarea:visible, select:visible').all();
  for (const el of elements) {
    const tag = await el.evaluate(node => node.tagName.toLowerCase());
    const type = await el.evaluate(node => node.getAttribute('type'));
    const readonly = await el.evaluate(node => node.hasAttribute('readonly') || node.hasAttribute('disabled'));
    
    if (readonly) continue;

    if (tag === 'input') {
      if (type === 'email') await el.fill(`test${Date.now()}@example.com`);
      else if (type === 'number') await el.fill('100');
      else if (type === 'checkbox') await el.check();
      else if (type === 'text' || !type) await el.fill(`Automated Test ${Date.now()}`);
    } else if (tag === 'textarea') {
      await el.fill(`Automated description ${Date.now()}`);
    } else if (tag === 'select') {
      // Pick the second option if available
      const options = await el.locator('option').all();
      if (options.length > 1) {
        const val = await options[1].getAttribute('value');
        if (val) await el.selectOption(val);
      }
    }
  }
}

export function runCrudTest(config: CrudTestConfig) {
  test.describe(`Admin CRUD - ${config.moduleName}`, () => {
    
    test.beforeEach(async ({ page }) => {
      // Login as Admin using API fixture
      await authenticatePage(page, 'admin');
      
      // Navigate to module page
      await page.goto(config.url);
      await page.waitForLoadState('load');
    });

    if (config.add) {
      test(`should ADD a new record in ${config.moduleName}`, async ({ page }) => {
        if (config.add!.openButtonSelector) {
          await page.click(config.add!.openButtonSelector);
        }
        
        await config.add!.fillForm(page);
        
        // Intercept API to ensure 201 or 200
        const submitPromise = page.waitForResponse(res => 
          res.url().includes(config.apiEndpoint) && 
          res.request().method() === 'POST'
        );
        
        await page.click(config.add!.submitSelector);
        
        const response = await submitPromise;
        expect(response.status()).toBeLessThan(400); // Expect success
        
        if (config.add!.verifyText) {
          await expect(page.locator(`text=${config.add!.verifyText}`).first()).toBeVisible({ timeout: 10000 });
        }
      });
    }

    if (config.edit) {
      test(`should EDIT a record in ${config.moduleName}`, async ({ page }) => {
        const editButton = await config.edit!.openButtonSelector(page);
        if (editButton) {
            await editButton.click();
            await config.edit!.fillForm(page);
            
            const submitPromise = page.waitForResponse(res => 
                res.url().includes(config.apiEndpoint) && 
                (res.request().method() === 'PUT' || res.request().method() === 'PATCH')
            );
            
            await page.click(config.edit!.submitSelector);
            const response = await submitPromise;
            expect(response.status()).toBeLessThan(400);
            
            if (config.edit!.verifyText) {
                await expect(page.locator(`text=${config.edit!.verifyText}`).first()).toBeVisible({ timeout: 10000 });
            }
        }
      });
    }

    if (config.delete) {
      test(`should DELETE a record in ${config.moduleName}`, async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());
        
        const deleteButton = await config.delete!.buttonSelector(page);
        if (deleteButton) {
            const deletePromise = page.waitForResponse(res => 
                res.url().includes(config.apiEndpoint) && 
                res.request().method() === 'DELETE'
            );
            
            await deleteButton.click();
            if (config.delete!.confirmSelector) {
                await page.click(config.delete!.confirmSelector);
            }
            
            const response = await deletePromise;
            expect(response.status()).toBeLessThan(400);
        }
      });
    }
  });
}
