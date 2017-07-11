import { AngularTableDemoPage } from './app.po';

describe('angular-table-demo App', () => {
  let page: AngularTableDemoPage;

  beforeEach(() => {
    page = new AngularTableDemoPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
