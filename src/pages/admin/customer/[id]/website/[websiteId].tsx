import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  Badge,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Alert,
  Spinner,
  Progress,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  ArrowLeft,
  Play,
  RefreshCw,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Info,
  ChevronDown,
  ChevronUp,
  X,
} from "react-feather";
import { toast } from "react-toastify";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import {
  CustomerWebsite,
  CrawlSession,
  CrawlPage,
  TrackingSession,
  WebsiteAnalytics,
  HeatmapData,
} from "Types/CustomerType";
import { CustomerService } from "utils/supabase/customerService";
import { CrawlService } from "utils/supabase/crawlService";
import { TrackingService } from "utils/supabase/trackingService";

const WebsiteDetailPage = () => {
  const router = useRouter();
  const { id, websiteId } = router.query;
  const [website, setWebsite] = useState<CustomerWebsite | null>(null);
  const [sessions, setSessions] = useState<CrawlSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CrawlSession | null>(null);
  const [pages, setPages] = useState<CrawlPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [activeTab, setActiveTab] = useState("1"); // 1 = Crawl, 2 = Analytics
  const [showStartCrawlModal, setShowStartCrawlModal] = useState(false);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
  const [showMetaTagsModal, setShowMetaTagsModal] = useState(false);
  const [selectedPageForMeta, setSelectedPageForMeta] = useState<CrawlPage | null>(null);
  const [crawlForm, setCrawlForm] = useState({
    max_depth: 3,
    max_pages: 100,
  });

  // Analytics states
  const [analytics, setAnalytics] = useState<WebsiteAnalytics | null>(null);
  const [trackingSessions, setTrackingSessions] = useState<TrackingSession[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string>("");
  const [selectedHeatmapType, setSelectedHeatmapType] = useState<'click' | 'move' | 'scroll'>('click');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Polling interval for progress
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPages = useCallback(async (sessionId: string) => {
    try {
      const pagesData = await CrawlService.getCrawlPagesBySessionId(sessionId);
      setPages(pagesData);
    } catch (error) {
      console.error("Error loading pages:", error);
    }
  }, []);

  const startPolling = useCallback((sessionId: string) => {
    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      try {
        const session = await CrawlService.getCrawlSessionById(sessionId);
        if (session) {
          setCurrentSession(session);
          await loadPages(sessionId);
          
          // Stop polling if completed or failed
          if (session.status === 'completed' || session.status === 'failed' || session.status === 'cancelled') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setCrawling(false);
          }
        }
      } catch (error) {
        console.error("Error polling crawl status:", error);
      }
    }, 2000);

    // Store interval reference
    pollIntervalRef.current = interval;
  }, [loadPages]);

  const loadData = useCallback(async () => {
    if (!websiteId || typeof websiteId !== "string") {
      console.error("Invalid websiteId:", websiteId);
      setLoading(false);
      return;
    }
    
    if (!id || typeof id !== "string") {
      console.error("Invalid id:", id);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Loading website data for:", websiteId);
      
      // Load website first
      let websiteData: CustomerWebsite | null = null;
      try {
        websiteData = await CustomerService.getWebsiteById(websiteId);
        console.log("Website data:", websiteData);
      } catch (websiteError: any) {
        console.error("Error loading website:", websiteError);
        toast.error(`Failed to load website: ${websiteError?.message || "Unknown error"}`);
        setLoading(false);
        return;
      }

      if (!websiteData) {
        console.error("Website not found");
        toast.error("Website not found");
        setLoading(false);
        return;
      }

      setWebsite(websiteData);

      // Load sessions separately to avoid blocking
      let sessionsData: CrawlSession[] = [];
      try {
        sessionsData = await CrawlService.getCrawlSessionsByWebsiteId(websiteId);
        console.log("Sessions data:", sessionsData);
      } catch (sessionsError: any) {
        console.error("Error loading sessions:", sessionsError);
        // Don't block if sessions fail to load
        toast.warning("Failed to load crawl sessions, but website loaded successfully");
      }

      setSessions(sessionsData || []);
      
      // Get latest session
      if (sessionsData && sessionsData.length > 0) {
        const latestSession = sessionsData[0];
        setCurrentSession(latestSession);
        try {
          await loadPages(latestSession.id);
        } catch (pagesError) {
          console.error("Error loading pages:", pagesError);
        }
        
        // If session is running, start polling
        if (latestSession.status === 'running') {
          startPolling(latestSession.id);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error loading data:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        websiteId,
        id,
      });
      toast.error(`Failed to load website data: ${error?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [websiteId, id, loadPages, startPolling]);

  useEffect(() => {
    if (websiteId && typeof websiteId === "string" && id && typeof id === "string") {
      loadData();
      if (activeTab === "2") {
        loadAnalytics();
      }
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [websiteId, id, loadData, activeTab]);

  const handleStartCrawl = async () => {
    if (!websiteId || typeof websiteId !== "string") return;

    setCrawling(true);
    setShowStartCrawlModal(false);

    try {
      const response = await fetch("/api/crawl/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          website_id: websiteId,
          max_depth: crawlForm.max_depth,
          max_pages: crawlForm.max_pages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start crawl");
      }

      const data = await response.json();
      toast.success("Crawl started successfully");

      // Reload data to get new session
      await loadData();
      
      // Start polling for the new session
      if (data.session_id) {
        startPolling(data.session_id);
      }
    } catch (error: any) {
      console.error("Error starting crawl:", error);
      toast.error(error.message || "Failed to start crawl");
      setCrawling(false);
    }
  };

  const handleBack = () => {
    router.push(`/admin/customer/${id}`);
  };

  const loadHeatmapData = useCallback(async () => {
    if (!websiteId || typeof websiteId !== "string" || !selectedPageUrl) return;

    try {
      const data = await TrackingService.getHeatmapData(
        websiteId,
        selectedPageUrl,
        selectedHeatmapType
      );
      setHeatmapData(data);
    } catch (error) {
      console.error("Error loading heatmap data:", error);
    }
  }, [websiteId, selectedPageUrl, selectedHeatmapType]);

  const loadAnalytics = useCallback(async () => {
    if (!websiteId || typeof websiteId !== "string") return;
    
    setLoadingAnalytics(true);
    try {
      const [analyticsData, sessionsData] = await Promise.all([
        TrackingService.getWebsiteAnalytics(websiteId),
        TrackingService.getTrackingSessionsByWebsiteId(websiteId, 50),
      ]);

      setAnalytics(analyticsData);
      setTrackingSessions(sessionsData);

      // Load heatmap data if page URL is selected
      if (selectedPageUrl) {
        await loadHeatmapData();
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [websiteId, selectedPageUrl, loadHeatmapData]);

  useEffect(() => {
    if (activeTab === "2" && selectedPageUrl) {
      loadHeatmapData();
    }
  }, [selectedPageUrl, selectedHeatmapType, activeTab, loadHeatmapData]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: "secondary", text: "Pending" },
      running: { color: "primary", text: "Running" },
      completed: { color: "success", text: "Completed" },
      failed: { color: "danger", text: "Failed" },
      cancelled: { color: "warning", text: "Cancelled" },
    };

    const statusInfo = statusMap[status] || { color: "secondary", text: status };
    return <Badge color={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="page-body">
        <Breadcrumbs
          title="Website Detail"
          mainTitle="Website Detail"
          parent="Customer"
        />
        <Container fluid>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "400px" }}
          >
            <Spinner color="primary" />
          </div>
        </Container>
      </div>
    );
  }

  if (!website && !loading) {
    return (
      <div className="page-body">
        <Breadcrumbs
          title="Website Detail"
          mainTitle="Website Detail"
          parent="Customer"
        />
        <Container fluid>
          <Row className="mb-3">
            <Col>
              <Button color="secondary" onClick={handleBack}>
                <ArrowLeft size={16} className="me-1" />
                Back
              </Button>
            </Col>
          </Row>
          <Alert color="danger">
            <h5>Website not found</h5>
            <p>The website you are looking for does not exist or has been deleted.</p>
            <Button color="primary" onClick={handleBack} className="mt-2">
              Go back to Customer Detail
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  if (!website) {
    return null;
  }

  const progressPercentage = currentSession
    ? currentSession.total_pages > 0
      ? Math.round((currentSession.crawled_pages / currentSession.total_pages) * 100)
      : 0
    : 0;

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Website Detail"
        mainTitle={`${website.name || "Website"} - ${website.url}`}
        parent="Customer"
      />
      <Container fluid>
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>{website.name || "Website"}</h5>
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  {website.url} <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </Col>
          <Col className="d-flex align-items-center justify-content-end">
            <div className="d-flex gap-2">
              <Button color="secondary" onClick={handleBack}>
                <ArrowLeft size={16} className="me-1" />
                Back
              </Button>
              <Button
                color="primary"
                onClick={() => setShowStartCrawlModal(true)}
                disabled={crawling}
              >
                {crawling ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Crawling...
                  </>
                ) : (
                  <>
                    <Play size={16} className="me-1" />
                    Start Crawl
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <CardBody>
            <Nav tabs className="nav-tabs border-tab">
              <NavItem>
                <NavLink
                  className={activeTab === "1" ? "active" : ""}
                  onClick={() => setActiveTab("1")}
                  style={{ cursor: "pointer" }}
                >
                  <FileText size={16} className="me-1" />
                  Website Crawl
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === "2" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("2");
                    loadAnalytics();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Info size={16} className="me-1" />
                  Analytics & Heatmap
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab} className="mt-3">
              {/* Crawl Tab */}
              <TabPane tabId="1">
                {/* Current Session Progress */}
                {currentSession && currentSession.status === "running" && (
          <Card className="mb-3">
            <CardHeader>
              <h5 className="mb-0">Crawl Progress</h5>
            </CardHeader>
            <CardBody>
              <div className="text-center mb-3">
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    margin: "0 auto 1rem",
                    position: "relative",
                  }}
                >
                  <img
                    src="/assets/images/crawler-animation.gif"
                    alt="Crawling..."
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      // Fallback ke icon animasi jika gambar tidak ada
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = "block";
                      }
                    }}
                  />
                  <RefreshCw
                    size={48}
                    className="text-primary"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "none",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </div>
                <style jsx global>{`
                  @keyframes spin {
                    from {
                      transform: translate(-50%, -50%) rotate(0deg);
                    }
                    to {
                      transform: translate(-50%, -50%) rotate(360deg);
                    }
                  }
                `}</style>
              </div>
              <Progress
                value={progressPercentage}
                color="primary"
                className="mb-2"
              >
                {progressPercentage}%
              </Progress>
              <div className="d-flex justify-content-between">
                <small>
                  <strong>Total Pages:</strong> {currentSession.total_pages}
                </small>
                <small>
                  <strong>Crawled:</strong> {currentSession.crawled_pages}
                </small>
                <small>
                  <strong>Failed:</strong> {currentSession.failed_pages}
                </small>
              </div>
              {currentSession.started_at && (
                <small className="text-muted d-block mt-2">
                  Started: {new Date(currentSession.started_at).toLocaleString()}
                </small>
              )}
            </CardBody>
          </Card>
        )}

        {/* Crawl Sessions */}
        <Row>
          <Col md={4}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Crawl Sessions</h5>
              </CardHeader>
              <CardBody style={{ maxHeight: "500px", overflowY: "auto" }}>
                {sessions.length > 0 ? (
                  <div className="list-group">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`list-group-item list-group-item-action ${
                          currentSession?.id === session.id ? "active" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setCurrentSession(session);
                          loadPages(session.id);
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="mb-1">
                              {getStatusBadge(session.status)}
                            </div>
                            <small className="text-muted d-block">
                              {new Date(session.created_at).toLocaleString()}
                            </small>
                            <small className="d-block mt-1">
                              Pages: {session.crawled_pages}/{session.total_pages}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert color="info" className="text-center mb-0">
                    No crawl sessions yet. Start a crawl to begin.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Crawled Pages */}
          <Col md={8}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Crawled Pages</h5>
                {currentSession && (
                  <Badge color="secondary">
                    {pages.length} pages
                  </Badge>
                )}
              </CardHeader>
              <CardBody style={{ maxHeight: "600px", overflowY: "auto" }}>
                {pages.length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th style={{ width: "30px" }}></th>
                        <th>URL</th>
                        <th>Title</th>
                        <th>Depth</th>
                        <th>Status</th>
                        <th>Links</th>
                        <th>Images</th>
                        <th>Meta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((page) => {
                        const isExpanded = expandedPageId === page.id;
                        const metaTags = page.meta_tags || {};
                        const hasMetaTags = Object.keys(metaTags).length > 0;
                        
                        return (
                          <>
                            <tr key={page.id}>
                              <td>
                                {hasMetaTags && (
                                  <Button
                                    color="link"
                                    size="sm"
                                    onClick={() => setExpandedPageId(isExpanded ? null : page.id)}
                                    style={{ padding: 0 }}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp size={16} />
                                    ) : (
                                      <ChevronDown size={16} />
                                    )}
                                  </Button>
                                )}
                              </td>
                              <td>
                                <a
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary"
                                  style={{ fontSize: "0.875rem" }}
                                >
                                  {page.url.length > 50
                                    ? `${page.url.substring(0, 50)}...`
                                    : page.url}
                                </a>
                              </td>
                              <td>
                                <div style={{ maxWidth: "200px" }}>
                                  <div className="text-truncate" title={page.title || ""}>
                                    {page.title || "-"}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Badge color="info">{page.depth}</Badge>
                              </td>
                              <td>{getStatusBadge(page.status)}</td>
                              <td>
                                {page.links && page.links.length > 0 ? (
                                  <Badge color="success">
                                    <i className="fa fa-link"></i> {page.links.length}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td>
                                {page.images && page.images.length > 0 ? (
                                  <Badge color="info">
                                    <i className="fa fa-image"></i> {page.images.length}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td>
                                {hasMetaTags ? (
                                  <div className="d-flex gap-1">
                                    
                                    <Button
                                      color="link"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedPageForMeta(page);
                                        setShowMetaTagsModal(true);
                                      }}
                                      style={{ padding: "2px 4px" }}
                                      title="View all meta tags in modal"
                                    >
                                      <Badge color="primary" className="text-xl">
                                        <i className="fa fa-info-circle text-xs"></i> {Object.keys(metaTags).length}
                                      </Badge>
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                            {isExpanded && hasMetaTags && (
                              <tr>
                                <td colSpan={8} style={{ padding: "15px", backgroundColor: "#f8f9fa" }}>
                                  <div className="mb-2">
                                    <strong className="text-primary">
                                      <Info size={14} className="me-1" />
                                      Meta Tags ({Object.keys(metaTags).length})
                                    </strong>
                                  </div>
                                  <Row>
                                    {Object.entries(metaTags).map(([key, value]) => {
                                      const displayValue = typeof value === "string" 
                                        ? value 
                                        : JSON.stringify(value);
                                      const isLong = displayValue.length > 150;
                                      
                                      return (
                                        <Col md={6} key={key} className="mb-2">
                                          <div>
                                            <strong className="text-muted" style={{ fontSize: "0.875rem" }}>
                                              {key}:
                                            </strong>
                                            <div
                                              style={{
                                                fontSize: "0.875rem",
                                                wordBreak: "break-word",
                                                color: "#495057",
                                                marginTop: "2px",
                                              }}
                                              title={isLong ? displayValue : undefined}
                                            >
                                              {isLong ? `${displayValue.substring(0, 150)}...` : displayValue}
                                            </div>
                                          </div>
                                        </Col>
                                      );
                                    })}
                                  </Row>
                                  {page.description && (
                                    <div className="mt-2 pt-2" style={{ borderTop: "1px solid #dee2e6" }}>
                                      <strong className="text-muted" style={{ fontSize: "0.875rem" }}>Description:</strong>
                                      <div style={{ fontSize: "0.875rem", marginTop: "4px", color: "#495057" }}>
                                        {page.description}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </Table>
                ) : (
                  <Alert color="info" className="text-center mb-0">
                    {currentSession
                      ? "No pages crawled yet."
                      : "Select a crawl session to view pages."}
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Meta Tags Modal */}
        <Modal
          isOpen={showMetaTagsModal}
          toggle={() => {
            setShowMetaTagsModal(false);
            setSelectedPageForMeta(null);
          }}
          size="lg"
        >
          <ModalHeader toggle={() => {
            setShowMetaTagsModal(false);
            setSelectedPageForMeta(null);
          }}>
            <Info size={18} className="me-2" />
            Meta Tags Details
          </ModalHeader>
          <ModalBody>
            {selectedPageForMeta && (
              <>
                <div className="mb-3">
                  <strong>URL:</strong>
                  <div className="mt-1">
                    <a
                      href={selectedPageForMeta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      {selectedPageForMeta.url}
                      <ExternalLink size={14} className="ms-1" />
                    </a>
                  </div>
                </div>
                
                {selectedPageForMeta.title && (
                  <div className="mb-3">
                    <strong>Title:</strong>
                    <div className="mt-1">{selectedPageForMeta.title}</div>
                  </div>
                )}

                {selectedPageForMeta.description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <div className="mt-1">{selectedPageForMeta.description}</div>
                  </div>
                )}

                {selectedPageForMeta.meta_tags && Object.keys(selectedPageForMeta.meta_tags).length > 0 ? (
                  <div>
                    <strong className="mb-2 d-block">All Meta Tags ({Object.keys(selectedPageForMeta.meta_tags).length}):</strong>
                    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                      <Table responsive bordered size="sm">
                        <thead>
                          <tr>
                            <th style={{ width: "30%" }}>Key</th>
                            <th style={{ width: "70%" }}>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(selectedPageForMeta.meta_tags).map(([key, value]) => {
                            const displayValue = typeof value === "string" 
                              ? value 
                              : JSON.stringify(value);
                            return (
                              <tr key={key}>
                                <td>
                                  <strong className="text-primary">{key}</strong>
                                </td>
                                <td style={{ wordBreak: "break-word" }}>
                                  {displayValue}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <Alert color="info">No meta tags found for this page.</Alert>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setShowMetaTagsModal(false);
                setSelectedPageForMeta(null);
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
              </TabPane>

              {/* Analytics Tab */}
              <TabPane tabId="2">
                {loadingAnalytics ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading analytics...</p>
                  </div>
                ) : (
                  <>
                    {/* Analytics Overview */}
                    {analytics && (
                      <Row className="mb-4">
                        <Col md={3}>
                          <Card className="text-center">
                            <CardBody>
                              <h3 className="text-primary">{analytics.total_sessions}</h3>
                              <p className="text-muted mb-0">Total Sessions</p>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="text-center">
                            <CardBody>
                              <h3 className="text-success">{analytics.total_page_views}</h3>
                              <p className="text-muted mb-0">Page Views</p>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="text-center">
                            <CardBody>
                              <h3 className="text-info">{analytics.total_clicks}</h3>
                              <p className="text-muted mb-0">Total Clicks</p>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="text-center">
                            <CardBody>
                              <h3 className="text-warning">{analytics.bounce_rate.toFixed(1)}%</h3>
                              <p className="text-muted mb-0">Bounce Rate</p>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    )}

                    {/* Tracking Script Installation */}
                    <Card className="mb-4">
                      <CardHeader>
                        <h5 className="mb-0">Tracking Script</h5>
                      </CardHeader>
                      <CardBody>
                        <p className="text-muted mb-3">
                          Add this script to your website to start tracking user behavior:
                        </p>
                        <div className="bg-light p-3 rounded">
                          <code style={{ fontSize: "0.875rem" }}>
                            {`<script src="${window.location.origin}/tracking-script.js" data-website-id="${websiteId}"></script>`}
                          </code>
                        </div>
                        <Button
                          color="link"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const script = `<script src="${window.location.origin}/tracking-script.js" data-website-id="${websiteId}"></script>`;
                            navigator.clipboard.writeText(script);
                            toast.success("Script copied to clipboard!");
                          }}
                        >
                          Copy Script
                        </Button>
                      </CardBody>
                    </Card>

                    {/* Heatmap Section */}
                    <Card className="mb-4">
                      <CardHeader>
                        <h5 className="mb-0">Heatmap</h5>
                      </CardHeader>
                      <CardBody>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Label>Select Page URL</Label>
                            <Input
                              type="select"
                              value={selectedPageUrl}
                              onChange={(e) => setSelectedPageUrl(e.target.value)}
                            >
                              <option value="">-- Select a page --</option>
                              {analytics?.top_pages.map((page, idx) => (
                                <option key={idx} value={page.url}>
                                  {page.url} ({page.views} views)
                                </option>
                              ))}
                            </Input>
                          </Col>
                          <Col md={6}>
                            <Label>Heatmap Type</Label>
                            <Input
                              type="select"
                              value={selectedHeatmapType}
                              onChange={(e) => setSelectedHeatmapType(e.target.value as any)}
                            >
                              <option value="click">Click Heatmap</option>
                              <option value="move">Mouse Move Heatmap</option>
                              <option value="scroll">Scroll Heatmap</option>
                            </Input>
                          </Col>
                        </Row>

                        {selectedPageUrl && heatmapData.length > 0 ? (
                          <div className="mt-3">
                            <Alert color="info">
                              <strong>{heatmapData.length}</strong> data points found for{" "}
                              <strong>{selectedHeatmapType}</strong> heatmap on this page.
                            </Alert>
                            <div
                              style={{
                                position: "relative",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                padding: "20px",
                                minHeight: "400px",
                                backgroundColor: "#f8f9fa",
                              }}
                            >
                              {/* Heatmap visualization would go here */}
                              <p className="text-muted text-center">
                                Heatmap visualization (requires canvas rendering)
                              </p>
                              <Table bordered size="sm" className="mt-3">
                                <thead>
                                  <tr>
                                    <th>X</th>
                                    <th>Y</th>
                                    <th>Interactions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {heatmapData.slice(0, 20).map((point, idx) => (
                                    <tr key={idx}>
                                      <td>{point.x}</td>
                                      <td>{point.y}</td>
                                      <td>
                                        <Badge color="primary">{point.value}</Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        ) : selectedPageUrl ? (
                          <Alert color="warning" className="mt-3">
                            No heatmap data available for this page yet. Make sure the tracking
                            script is installed and users are visiting the page.
                          </Alert>
                        ) : (
                          <Alert color="info" className="mt-3">
                            Select a page URL to view heatmap data.
                          </Alert>
                        )}
                      </CardBody>
                    </Card>

                    {/* Tracking Sessions */}
                    <Card className="mb-4">
                      <CardHeader>
                        <h5 className="mb-0">Recent Sessions</h5>
                      </CardHeader>
                      <CardBody>
                        {trackingSessions.length > 0 ? (
                          <Table responsive striped>
                            <thead>
                              <tr>
                                <th>Session ID</th>
                                <th>Device</th>
                                <th>Browser</th>
                                <th>Page Views</th>
                                <th>Clicks</th>
                                <th>Duration</th>
                                <th>Started</th>
                              </tr>
                            </thead>
                            <tbody>
                              {trackingSessions.map((session) => (
                                <tr key={session.id}>
                                  <td>
                                    <code style={{ fontSize: "0.75rem" }}>
                                      {session.session_id.substring(0, 20)}...
                                    </code>
                                  </td>
                                  <td>
                                    <Badge color="secondary">
                                      {session.device_type || "Unknown"}
                                    </Badge>
                                  </td>
                                  <td>{session.browser || "-"}</td>
                                  <td>{session.page_views}</td>
                                  <td>{session.clicks}</td>
                                  <td>
                                    {session.duration
                                      ? `${Math.round(session.duration / 60)}m ${session.duration % 60}s`
                                      : "-"}
                                  </td>
                                  <td>
                                    {new Date(session.started_at).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <Alert color="info">
                            No tracking sessions found. Install the tracking script to start
                            collecting data.
                          </Alert>
                        )}
                      </CardBody>
                    </Card>

                    {/* Top Pages & Referrers */}
                    {analytics && (
                      <Row>
                        <Col md={6}>
                          <Card>
                            <CardHeader>
                              <h5 className="mb-0">Top Pages</h5>
                            </CardHeader>
                            <CardBody>
                              {analytics.top_pages.length > 0 ? (
                                <Table size="sm">
                                  <thead>
                                    <tr>
                                      <th>Page</th>
                                      <th>Views</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analytics.top_pages.map((page, idx) => (
                                      <tr key={idx}>
                                        <td>
                                          <a
                                            href={page.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary"
                                            style={{ fontSize: "0.875rem" }}
                                          >
                                            {page.url.length > 50
                                              ? page.url.substring(0, 50) + "..."
                                              : page.url}
                                          </a>
                                        </td>
                                        <td>
                                          <Badge color="primary">{page.views}</Badge>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <p className="text-muted">No page views yet.</p>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card>
                            <CardHeader>
                              <h5 className="mb-0">Device Types</h5>
                            </CardHeader>
                            <CardBody>
                              {analytics.device_types.length > 0 ? (
                                <Table size="sm">
                                  <thead>
                                    <tr>
                                      <th>Device</th>
                                      <th>Sessions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analytics.device_types.map((device, idx) => (
                                      <tr key={idx}>
                                        <td>
                                          <Badge color="info">{device.type}</Badge>
                                        </td>
                                        <td>{device.count}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <p className="text-muted">No device data yet.</p>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    )}
                  </>
                )}
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>

        {/* Start Crawl Modal */}
        <Modal
          isOpen={showStartCrawlModal}
          toggle={() => setShowStartCrawlModal(false)}
        >
          <ModalHeader toggle={() => setShowStartCrawlModal(false)}>
            Start Website Crawl
          </ModalHeader>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartCrawl();
            }}
          >
            <ModalBody>
              <FormGroup>
                <Label for="max-depth">Max Depth</Label>
                <Input
                  type="number"
                  id="max-depth"
                  min="1"
                  max="10"
                  value={crawlForm.max_depth}
                  onChange={(e) =>
                    setCrawlForm({
                      ...crawlForm,
                      max_depth: parseInt(e.target.value) || 3,
                    })
                  }
                  required
                />
                <small className="text-muted">
                  Maximum depth to crawl (1-10)
                </small>
              </FormGroup>
              <FormGroup>
                <Label for="max-pages">Max Pages</Label>
                <Input
                  type="number"
                  id="max-pages"
                  min="1"
                  max="1000"
                  value={crawlForm.max_pages}
                  onChange={(e) =>
                    setCrawlForm({
                      ...crawlForm,
                      max_pages: parseInt(e.target.value) || 100,
                    })
                  }
                  required
                />
                <small className="text-muted">
                  Maximum number of pages to crawl (1-1000)
                </small>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setShowStartCrawlModal(false)}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Start Crawl
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default WebsiteDetailPage;

