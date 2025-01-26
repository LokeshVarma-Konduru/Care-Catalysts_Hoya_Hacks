export const dashboardStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: '64px', // Height of the navbar
  },
  mainContent: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  filterContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    minWidth: '150px',
    fontSize: '0.9rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: '#1976d2',
    },
  },
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  },
  '@media (max-width: 600px)': {
    mainContent: {
      padding: '1rem',
    },
    card: {
      padding: '1rem',
    },
    filterContainer: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    select: {
      width: '100%',
    }
  },
  label: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: 500
  },
  insightCard: {
    display: 'flex',
    gap: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  insightItem: {
    flex: 1
  },
  insightLabel: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.25rem'
  },
  insightValue: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#333'
  }
};
