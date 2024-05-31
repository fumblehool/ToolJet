import React, { Suspense } from 'react';
// eslint-disable-next-line no-unused-vars
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { authorizeWorkspace, updateCurrentSession } from '@/_helpers/authorizeWorkspace';
import { authenticationService, tooljetService } from '@/_services';
import { withRouter } from '@/_hoc/withRouter';
import {
  PrivateRoute,
  AdminRoute,
  AppsRoute,
  SwitchWorkspaceRoute,
  OrganizationInviteRoute,
  SuperAdminRoute,
} from '@/Routes';
import { HomePage } from '@/HomePage';
import { LoginPage } from '@/LoginPage';
import { SignupPage } from '@/SignupPage';
import { TooljetDatabase } from '@/TooljetDatabase';
import { OrganizationInvitationPage } from '@/ConfirmationPage';
import { Authorize } from '@/Oauth2';
import { Authorize as Oauth } from '@/Oauth';
import { Viewer } from '@/Editor';
import { OrganizationSettings } from '@/OrganizationSettingsPage';
import { AuditLogsPage } from '@/AuditLogs';
import { AccountSettings } from '../AccountSettings/AccountSettings';
import { ForgotPassword } from '@/ForgotPassword';
import { ResetPassword } from '@/ResetPassword';
import { MarketplacePage } from '@/MarketplacePage';
import SwitchWorkspacePage from '@/HomePage/SwitchWorkspacePage';
import { GlobalDatasources } from '@/GlobalDatasources';
import { GitSyncConfig } from '@/GitSyncComponent/GitSyncConfig';
import { lt } from 'semver';
import Toast from '@/_ui/Toast';
import { VerificationSuccessInfoScreen } from '@/SuccessInfoScreen';
import '@/_styles/theme.scss';
import { AppLoader } from '@/AppLoader';
import SetupScreenSelfHost from '../SuccessInfoScreen/SetupScreenSelfHost';
import { InstanceSettings } from '@/InstanceSettingsPage';
import initPosthog from '../_helpers/initPosthog';
import { ManageAllUsers } from '@/ManageAllUsers';
import { ManageInstanceSettings, ManageWhiteLabelling } from '@/ManageInstanceSettings';
import { ManageLicenseKey } from '@/ManageLicenseKey';
export const BreadCrumbContext = React.createContext({});
import 'react-tooltip/dist/react-tooltip.css';
import { getWorkspaceIdOrSlugFromURL } from '@/_helpers/routes';
import ErrorPage from '@/_components/ErrorComponents/ErrorPage';
import WorkspaceConstants from '@/WorkspaceConstants';
import { AuthRoute } from '@/Routes/AuthRoute';
import { useAppDataStore } from '@/_stores/appDataStore';
import cx from 'classnames';
import useAppDarkMode from '@/_hooks/useAppDarkMode';
import { ManageOrgUsers } from '@/ManageOrgUsers';
import { ManageGroupPermissions } from '@/ManageGroupPermissions';
import { ManageOrgVars } from '@/ManageOrgVars';
import { CopilotSetting } from '@/CopilotSettings';
import { CustomStylesEditor } from '@/CustomStylesEditor';
import LdapLoginPage from '../LdapLogin';
import { Settings } from '@/Settings';
import { ManageSubscriptionKey } from '@/ManageLicenseKey/MangeSubscriptionKey';
import { SubscriptionKey } from '@/ManageLicenseKey/SubscriptionKey';
import InstanceLogin from '@/ManageInstanceSettings/InstanceLogin';
import { ManageWorkspaceArchivePageComponent } from '@/_ui/ManageWorkspaceArchive/ManageWorspaceArchivePage';
import OrganizationLogin from '@/_components/OrganizationLogin/OrganizationLogin';
import { SuperadminLoginPage } from '@/LoginPage/SuperadminLoginPage';
import { OpenIdLoginPage } from '@/LoginPage/OpenId';
import { setFaviconAndTitle } from '@white-label/whiteLabelling';

const AppWrapper = (props) => {
  const { isAppDarkMode } = useAppDarkMode();
  return (
    <Suspense fallback={null}>
      <BrowserRouter basename={window.public_config?.SUB_PATH || '/'}>
        <AppWithRouter props={props} isAppDarkMode={isAppDarkMode} />
      </BrowserRouter>
    </Suspense>
  );
};

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: null,
      fetchedMetadata: false,
      darkMode: localStorage.getItem('darkMode') === 'true',
      isEditorOrViewer: '',
    };
  }
  updateSidebarNAV = (val) => {
    this.setState({ sidebarNav: val });
  };
  fetchMetadata = () => {
    tooljetService.fetchMetaData().then((data) => {
      updateCurrentSession({
        instance_id: data?.instance_id,
      });
      useAppDataStore.getState().actions.setMetadata(data);
      localStorage.setItem('currentVersion', data.installed_version);
      if (data.latest_version && lt(data.installed_version, data.latest_version) && data.version_ignored === false) {
        this.setState({ updateAvailable: true });
      }
    });
  };

  initTelemetryAndSupport(currentUser) {
    const isApplicationsPath = window.location.pathname.includes('/applications/');
    function initFreshChat() {
      window.fcWidget.init({
        token: '0ef214a3-8ae1-41fb-b0d0-57764bf8f64b',
        host: 'https://wchat.freshchat.com',
        config: {
          cssNames: {
            widget: 'custom_fc_frame',
          },
          content: {
            actions: {
              push_notify_yes: 'Yes',
            },
          },
          headerProperty: {
            hideChatButton: true,
            direction: 'rtl',
          },
        },
      });

      window.fcWidget.user.setFirstName(`${currentUser.first_name} ${currentUser.last_name}`);

      window.fcWidget.user.setEmail(currentUser.email);
    }
    function initialize(i, t) {
      var e;
      i.getElementById(t)
        ? initFreshChat()
        : (((e = i.createElement('script')).id = t),
          (e.async = !0),
          (e.src = 'https://wchat.freshchat.com/js/widget.js'),
          (e.onload = initFreshChat),
          i.head.appendChild(e));
    }
    function initiateCall() {
      initialize(document, 'Freshdesk Messaging-js-sdk');
    }

    if (!isApplicationsPath) {
      //freshchat needed only in editor mode and not in viwermode
      window.addEventListener
        ? window.addEventListener('load', initiateCall, !1)
        : window.attachEvent('load', initiateCall, !1);

      try {
        initiateCall();
      } catch (e) {
        console.log(e);
      }
    }
    initPosthog(currentUser);
  }

  componentDidMount() {
    authorizeWorkspace();
    this.fetchMetadata();
    // setInterval(this.fetchMetadata, 1000 * 60 * 60 * 1);
    this.counter = 0;
    this.interval = setInterval(() => {
      ++this.counter;
      const current_user = authenticationService.currentSessionValue?.current_user;
      if (current_user?.id) {
        setFaviconAndTitle(null, null, this.props.location);;
        this.initTelemetryAndSupport(current_user);
        clearInterval(this.interval);
      } else if (this.counter > 10) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // check if its getting routed from editor
  checkPreviousRoute = (route) => {
    if (route.includes('/apps')) {
      return true;
    }
    return false;
  };

  componentDidUpdate(prevProps) {
    // Check if the current location is the dashboard (homepage)
    if (
      this.props.location.pathname === `/${getWorkspaceIdOrSlugFromURL()}` &&
      prevProps.location.pathname !== `/${getWorkspaceIdOrSlugFromURL()}` &&
      this.checkPreviousRoute(prevProps.location.pathname) &&
      prevProps.location.pathname !== `/:workspaceId`
    ) {
      // Reload the page for clearing already set intervals
      window.location.reload();
    }
  }

  switchDarkMode = (newMode) => {
    this.setState({ darkMode: newMode });
    useAppDataStore.getState().actions.updateIsTJDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  render() {
    const { updateAvailable, darkMode, isEditorOrViewer } = this.state;
    let toastOptions = {
      style: {
        wordBreak: 'break-all',
      },
    };

    if (isEditorOrViewer === 'viewer' ? this.props.isAppDarkMode : darkMode) {
      toastOptions = {
        className: 'toast-dark-mode',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          wordBreak: 'break-all',
        },
      };
    }
    const { sidebarNav } = this.state;
    const { updateSidebarNAV } = this;
    return (
      <>
        <div
          className={cx('main-wrapper', {
            'theme-dark dark-theme': !isEditorOrViewer && darkMode,
          })}
          data-cy="main-wrapper"
        >
          {updateAvailable && (
            <div className="alert alert-info alert-dismissible" role="alert">
              <h3 className="mb-1">Update available</h3>
              <p>A new version of ToolJet has been released.</p>
              <div className="btn-list">
                <a
                  href="https://docs.tooljet.io/docs/setup/updating"
                  target="_blank"
                  className="btn btn-info"
                  rel="noreferrer"
                >
                  Read release notes & update
                </a>
                <a
                  onClick={() => {
                    tooljetService.skipVersion();
                    this.setState({ updateAvailable: false });
                  }}
                  className="btn"
                >
                  Skip this version
                </a>
              </div>
            </div>
          )}
          <BreadCrumbContext.Provider value={{ sidebarNav, updateSidebarNAV }}>
            <Routes>
              <Route
                path="/login/super-admin"
                exact
                element={
                  <AuthRoute {...this.props}>
                    <SuperadminLoginPage />
                  </AuthRoute>
                }
              />
              <Route path="/setup" exact element={<SetupScreenSelfHost {...this.props} darkMode={darkMode} />} />
              <Route path="/ldap/:organizationId" element={<LdapLoginPage {...this.props} darkMode={darkMode} />} />
              <Route
                path="/login/:organizationId"
                exact
                element={
                  <AuthRoute {...this.props}>
                    <LoginPage {...this.props} />
                  </AuthRoute>
                }
              />
              <Route
                path="/login"
                exact
                element={
                  <AuthRoute {...this.props}>
                    <LoginPage {...this.props} />
                  </AuthRoute>
                }
              />
              <Route path="/login/:organizationId/sso/openid" exact element={<OpenIdLoginPage />} />
              <Route path="/login/sso/openid" exact element={<OpenIdLoginPage />} />
              <Route path="/sso/:origin/:configId" exact element={<Oauth {...this.props} />} />
              <Route path="/sso/:origin" exact element={<Oauth {...this.props} />} />
              <Route
                path="/signup/:organizationId"
                exact
                element={
                  <AuthRoute {...this.props}>
                    <SignupPage {...this.props} />
                  </AuthRoute>
                }
              />
              <Route
                path="/signup"
                exact
                element={
                  <AuthRoute {...this.props}>
                    <SignupPage {...this.props} />
                  </AuthRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/invitations/:token" element={<VerificationSuccessInfoScreen />} />
              <Route
                path="/invitations/:token/workspaces/:organizationToken"
                element={
                  <OrganizationInviteRoute {...this.props}>
                    <VerificationSuccessInfoScreen />
                  </OrganizationInviteRoute>
                }
              />
              <Route
                path="/organization-invitations/:token"
                element={
                  <OrganizationInviteRoute {...this.props} isOrgazanizationOnlyInvite={true}>
                    <OrganizationInvitationPage {...this.props} darkMode={darkMode} />
                  </OrganizationInviteRoute>
                }
              />
              <Route
                exact
                path="/:workspaceId/apps/:slug/:pageHandle?/*"
                element={
                  <AppsRoute componentType="editor">
                    <AppLoader
                      switchDarkMode={this.switchDarkMode}
                      darkMode={darkMode}
                      setEditorOrViewer={(value) => this.setState({ isEditorOrViewer: value })}
                    />
                  </AppsRoute>
                }
              />
              <Route
                exact
                path="/:workspaceId/workspace-constants"
                element={
                  <PrivateRoute>
                    <WorkspaceConstants switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </PrivateRoute>
                }
              />
              <Route
                exact
                path="/applications/:slug/:pageHandle?"
                element={
                  <AppsRoute componentType="viewer">
                    <Viewer
                      switchDarkMode={this.switchDarkMode}
                      darkMode={this.props.isAppDarkMode}
                      setEditorOrViewer={(value) => this.setState({ isEditorOrViewer: value })}
                    />
                  </AppsRoute>
                }
              />
              <Route
                exact
                path="/applications/:slug/versions/:versionId/environments/:environmentId/:pageHandle?"
                element={
                  <AppsRoute componentType="viewer">
                    <Viewer
                      switchDarkMode={this.switchDarkMode}
                      darkMode={this.props.isAppDarkMode}
                      setEditorOrViewer={(value) => this.setState({ isEditorOrViewer: value })}
                    />
                  </AppsRoute>
                }
              />
              <Route
                exact
                path="/oauth2/authorize"
                element={
                  <PrivateRoute>
                    <Authorize switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </PrivateRoute>
                }
              />
              <Route
                exact
                path="/:workspaceId/workspace-settings"
                element={
                  <AdminRoute {...this.props}>
                    <OrganizationSettings switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </AdminRoute>
                }
              >
                <Route
                  path="users"
                  element={<ManageOrgUsers switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="groups"
                  element={<ManageGroupPermissions switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="workspace-login"
                  element={<OrganizationLogin switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="workspace-variables"
                  element={<ManageOrgVars switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="configure-git"
                  element={<GitSyncConfig switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="copilot"
                  element={<CopilotSetting />}
                  switchDarkMode={this.switchDarkMode}
                  darkMode={darkMode}
                />
                <Route
                  path="custom-styles"
                  element={<CustomStylesEditor switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
              </Route>
              <Route
                exact
                path="/instance-settings"
                element={
                  <SuperAdminRoute {...this.props}>
                    <InstanceSettings switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </SuperAdminRoute>
                }
              >
                <Route
                  path="all-users"
                  element={<ManageAllUsers switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="manage-instance-settings"
                  element={<ManageInstanceSettings switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="all-workspaces"
                  element={
                    <ManageWorkspaceArchivePageComponent switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  }
                />
                <Route
                  path="white-labelling"
                  element={<ManageWhiteLabelling switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="license"
                  element={<ManageLicenseKey switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
                <Route
                  path="instance-login"
                  element={<InstanceLogin switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
                />
              </Route>
              <Route
                exact
                path="/:workspaceId/settings"
                element={
                  <AdminRoute>
                    <Settings switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </AdminRoute>
                }
              >
                <Route
                  path="subscription"
                  element={
                    <AdminRoute>
                      <ManageSubscriptionKey switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                    </AdminRoute>
                  }
                />
                <Route
                  path="white-labelling"
                  element={
                    <AdminRoute>
                      <ManageWhiteLabelling switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                    </AdminRoute>
                  }
                />
              </Route>
              <Route
                exact
                path="/:workspaceId/audit-logs"
                element={
                  <AdminRoute {...this.props}>
                    <AuditLogsPage switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </AdminRoute>
                }
              />
              <Route
                exact
                path="/:workspaceId/account-settings"
                element={
                  <PrivateRoute>
                    <AccountSettings switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/:workspaceId/add-license-key"
                element={
                  <AdminRoute>
                    <SubscriptionKey switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </AdminRoute>
                }
              />
              <Route
                exact
                path="/:workspaceId/data-sources"
                element={
                  <PrivateRoute>
                    <GlobalDatasources switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </PrivateRoute>
                }
              />
              <Route
                exact
                path="/applications/:id/versions/:versionId/:pageHandle?"
                element={
                  <PrivateRoute>
                    <Viewer switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </PrivateRoute>
                }
              />
              <Route
                exact
                path="/applications/:slug/:pageHandle?"
                element={
                  <PrivateRoute>
                    <Viewer switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </PrivateRoute>
                }
              />
              {window.public_config?.ENABLE_TOOLJET_DB == 'true' && (
                <Route
                  exact
                  path="/:workspaceId/database"
                  element={
                    <PrivateRoute>
                      <TooljetDatabase switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                    </PrivateRoute>
                  }
                />
              )}

              {window.public_config?.ENABLE_MARKETPLACE_FEATURE === 'true' && (
                <Route
                  exact
                  path="/integrations"
                  element={
                    <AdminRoute {...this.props}>
                      <MarketplacePage switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                    </AdminRoute>
                  }
                />
              )}
              <Route exact path="/" element={<Navigate to="/:workspaceId" />} />
              <Route
                exact
                path="/error/:errorType"
                element={<ErrorPage switchDarkMode={this.switchDarkMode} darkMode={darkMode} />}
              />
              <Route
                exact
                path="/app-url-archived"
                element={
                  <SwitchWorkspacePage
                    switchDarkMode={this.switchDarkMode}
                    darkMode={darkMode}
                    archived={true}
                    isAppUrl={true}
                  />
                }
              />
              <Route
                exact
                path="/switch-workspace"
                element={
                  <SwitchWorkspaceRoute>
                    <SwitchWorkspacePage switchDarkMode={this.switchDarkMode} darkMode={darkMode} />
                  </SwitchWorkspaceRoute>
                }
              />

              <Route
                exact
                path="/switch-workspace-archived"
                element={
                  <SwitchWorkspaceRoute>
                    <SwitchWorkspacePage switchDarkMode={this.switchDarkMode} darkMode={darkMode} archived={true} />
                  </SwitchWorkspaceRoute>
                }
              />
              <Route
                exact
                path="/:workspaceId"
                element={
                  <PrivateRoute>
                    <HomePage switchDarkMode={this.switchDarkMode} darkMode={darkMode} appType={'front-end'} />
                  </PrivateRoute>
                }
              />
              {window.public_config?.ENABLE_WORKFLOWS_FEATURE === 'true' && (
                <Route
                  exact
                  path="/:workspaceId/workflows"
                  element={
                    <AdminRoute {...this.props}>
                      <HomePage switchDarkMode={this.switchDarkMode} darkMode={darkMode} appType={'workflow'} />
                    </AdminRoute>
                  }
                />
              )}
              <Route
                path="*"
                render={() => {
                  if (authenticationService?.currentSessionValue?.current_organization_id) {
                    return <Navigate to="/:workspaceId" />;
                  }
                  return <Navigate to="/login" />;
                }}
              />
            </Routes>
          </BreadCrumbContext.Provider>
          <div id="modal-div"></div>
        </div>

        <Toast toastOptions={toastOptions} />
      </>
    );
  }
}

export const App = AppWrapper;
const AppWithRouter = withRouter(AppComponent);
