import { test, expect } from '@playwright/test';

test('Home carrega com hero, categorias e produtos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'DROP BSB' }).first()).toBeVisible();
  await expect(page.getByText('Categorias', { exact: true })).toBeVisible();
  await expect(page.getByText('Novos na DROP', { exact: true })).toBeVisible();
});
